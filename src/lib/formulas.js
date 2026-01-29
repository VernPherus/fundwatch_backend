import { prisma } from "../lib/prisma.js";

/**
 * Fund and financial calculation helpers.
 * Centralized logic for totals, balances, and utilization.
 */

/**
 * Sum of initial balances across funds (total allocation).
 * @param {Array<{ initialBalance?: number | string }>} funds
 * @returns {number}
 */
export function totalAllocation(funds) {
  if (!Array.isArray(funds)) return 0;
  return funds.reduce((sum, f) => sum + Number(f?.initialBalance ?? 0), 0);
}

/**
 * Remaining balance after deductions.
 * @param {number | string} initialBalance
 * @param {number | string} totalSpent
 * @returns {number}
 */
export function remainingBalance(initialBalance, totalSpent) {
  return Number(initialBalance ?? 0) - Number(totalSpent ?? 0);
}

/**
 * Utilization rate (percent used).
 * @param {number | string} totalSpent
 * @param {number | string} initialBalance
 * @returns {number} 0–100+
 */
export function utilizationRate(totalSpent, initialBalance) {
  const init = Number(initialBalance ?? 0);
  if (init <= 0) return 0;
  return (Number(totalSpent ?? 0) / init) * 100;
}

/**
 * GRAND TOTAL
 * @param {Array} disbursements
 * @returns
 */
export const grandTotal = async (disbursements) => {
  //Calculate grand total from all disbursement net amounts

  return ""; //grand total
};

/**
 * CALCLUTAED GROSS
 * @param {Array} items
 */
export const calculateGross = (items) => {
  if (!Array.isArray(items)) return 0;

  return items.reduce((sum, item) => {
    return sum + Number(item.amount || 0);
  }, 0);
};

/**
 * CALCULATE DEDUCTIONS
 * @param {Array} deductions
 * @returns
 */
export const calculateDeductions = (deductions) => {
  if (!Array.isArray(deductions)) return 0;

  return deductions.reduce((sum, ded) => {
    return sum + Number(ded.amount || 0);
  }, 0);
};
