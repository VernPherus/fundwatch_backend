
/**
 * * NEW FUND: Create fund source
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const newFund = async (req, res) => {
    return res.status(200).json({message: "Created new fund source"});
}

/**
 * * DISPLAY FUND: 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const displayFund = async (req, res) => {
    return res.status(200).json({message: "Display funds for dashboard"})
}

/**
 * * SHOW FUND: 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const showFund = async (req, res) => {
    return res.status(200).json({message: "Show funds"})
}

/**
 * * EDIT FUND: 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const editFund = async (req, res) => {
    return res.status(200).json({message: "Edit funds"});
}

/**
 * * DEACTIVATE FUND:  
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const deactivateFund = async (req, res) => {
    return res.status(200).json({message: "Deactivated fund"})
}
