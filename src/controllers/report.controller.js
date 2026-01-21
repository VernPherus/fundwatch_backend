import { prisma } from "../lib/prisma.js";
import ExcelJS from "exceljs";
import { startOfMonth, endOfMonth, format } from "date-fns";

/**
 * * GENERATE SPV (Summary of Paid Vouchers)
 * Generates an Excel
 * GET /api/reports/spv?year=2025&month=09&fundId=1
 */
export const generateSPV = async (req, res) => {
  const { year, month, fundId } = req.query;

  try {
    //* Validation
    if (!year || !month || !fundId) {
      return res
        .status(400)
        .json({ message: "Year, Month, and Fund ID are required." });
    }

    //* Define Date Range
    // Note: Month is 0-indexed in JS dates if constructing manually, but usually passed as 1-12
    const startDate = startOfMonth(new Date(Number(year), Number(month) - 1));
    const endDate = endOfMonth(new Date(Number(year), Number(month) - 1));

    //* Fetch Data
    const fund = await prisma.fundSource.findUnique({
      where: { id: Number(fundId) },
    });

    if (!fund)
      return res.status(404).json({ message: "Fund Source not found." });

    const disbursements = await prisma.disbursement.findMany({
      where: {
        fundSourceId: Number(fundId),
        status: "approved", // Only show paid/approved vouchers
        dateReceived: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payee: true,
        items: true, // We need items to get UACS codes
      },
      orderBy: {
        dateReceived: "asc",
      },
    });

    //* Create Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Summary of Paid Vouchers");

    // --- SETUP COLUMNS (Widths) ---
    worksheet.columns = [
      { key: "date", width: 12 }, // A
      { key: "ada", width: 15 }, // B
      { key: "dv", width: 15 }, // C
      { key: "ors", width: 15 }, // D
      { key: "rcc", width: 15 }, // E
      { key: "payee", width: 30 }, // F
      { key: "uacs", width: 15 }, // G
      { key: "nature", width: 30 }, // H
      { key: "amount", width: 15 }, // I
      { key: "remarks", width: 15 }, // J
    ];

    // --- DRAW HEADERS (Matching your Image) ---
    // Row 1: Appendix Label
    worksheet.mergeCells("J1:K1");
    worksheet.getCell("J1").value = "Appendix 13";
    worksheet.getCell("J1").font = { italic: true };

    // Row 3: Title
    worksheet.mergeCells("A3:J3");
    const titleCell = worksheet.getCell("A3");
    titleCell.value = "SUMMARY OF PAID VOUCHERS";
    titleCell.alignment = { horizontal: "center" };
    titleCell.font = { bold: true, size: 14 };

    // Row 4: Period
    worksheet.mergeCells("A4:J4");
    const periodCell = worksheet.getCell("A4");
    periodCell.value = `Period Covered: ${format(
      startDate,
      "MMMM dd"
    )} to ${format(endDate, "MMMM dd, yyyy")}`;
    periodCell.alignment = { horizontal: "center" };
    periodCell.font = { bold: true };

    // Row 6-8: Entity Info (Left) & Report Info (Right)
    worksheet.getCell("A6").value =
      "Entity Name : Department of Science and Technology"; // You can make this dynamic later
    worksheet.getCell(
      "A7"
    ).value = `Fund Cluster : ${fund.code} - ${fund.name}`;
    worksheet.getCell("A8").value = `Bank Name/Account No. : ${
      fund.description || "N/A"
    }`; // Assuming bank details are in description or you add a column

    worksheet.getCell("H7").value = `Report No.: ${year}-${month}-001`; // Logic for report number
    worksheet.getCell("H8").value = "Sheet No.:";

    // --- TABLE HEADERS ---
    const headerRowIdx = 10;
    const headers = [
      "Date",
      "ADA/Check\nSerial No.",
      "DV/Payroll No.",
      "ORS/BURS No.",
      "Responsibility\nCenter Code",
      "Payee",
      "UACS Object\nCode",
      "Nature of Payment",
      "Amount",
      "Remarks",
    ];

    const headerRow = worksheet.getRow(headerRowIdx);
    headerRow.values = headers;
    headerRow.height = 30; // Taller for wrapped text

    // Style the header row
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // --- POPULATE DATA ---
    let currentRowIdx = headerRowIdx + 1;
    let totalAmount = 0;

    disbursements.forEach((d) => {
      // Logic: If multiple items, join UACS codes or pick the first one
      const uacs = d.items.map((i) => i.accountCode).join(", ");

      const rowValues = [
        d.dateReceived ? format(d.dateReceived, "MM/dd/yyyy") : "",
        d.lddapNum || d.acicNum || "", // ADA or Check No
        d.dvNum || "",
        d.orsNum || "",
        d.respCode || "",
        d.payee?.name || "",
        uacs,
        d.particulars || "",
        Number(d.netAmount), // Ensure it's a number
        "", // Remarks
      ];

      const row = worksheet.getRow(currentRowIdx);
      row.values = rowValues;

      // Add to Total
      totalAmount += Number(d.netAmount);

      // Style Data Row (Borders)
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        // Format Amount Column (Column 9 / 'I')
        if (colNumber === 9) {
          cell.numFmt = "#,##0.00";
        }
      });

      currentRowIdx++;
    });

    // --- FOOTER (Grand Total) ---
    const footerRow = worksheet.getRow(currentRowIdx);
    footerRow.getCell(8).value = "GRAND TOTAL";
    footerRow.getCell(8).font = { bold: true };
    footerRow.getCell(8).alignment = { horizontal: "right" };

    const totalCell = footerRow.getCell(9);
    totalCell.value = totalAmount;
    totalCell.numFmt = "#,##0.00";
    totalCell.font = { bold: true };
    totalCell.border = {
      top: { style: "double" },
      bottom: { style: "double" },
    }; // Accounting double underline

    //* Send Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SPV-${year}-${month}-${fund.code}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log("Error generating report:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
