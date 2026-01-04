/**
 * * STORE RECORD: 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const storeRec = async (req, res) => {
  return res.status(200).json({ message: "Store Disbursement" });
};

/**
 * * DISPLAY RECORD: Display disbursement records for dashboard
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const displayRec = async (req, res) => {
    return res.status(200).json({message: "Display Disbursement"})
}

/**
 * * SHOW RECORD: Show all data in one disbursement
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const showRec = async (req, res) => {
  return res.status(200).json({ message: "Show Disbursement" });
};

/**
 * * EDIT RECORD: Edit a record's reference codes, fund source and payee
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const editRec = async (req, res) => {
  return res.status(200).json({ message: "Edid  Disbursement" });
};

/**
 * * APPROVE RECORD
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const approveRec = async (req, res) => {
  return res.status(200).json({ message: "Show  Disbursement" });
};

/**
 * * REMOVE RECORD: 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const removeRec = async (req, res) => {
  return res.status(200).json({ message: "Show  Disbursement" });
};
