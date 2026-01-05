/**
 * * NEW PAYEE: Create payee source
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const newPayee = async (req, res) => {
  return res.status(200).json({ message: "Created new payee source" });
};

/**
 * * DISPLAY PAYEE:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const displayPayee = async (req, res) => {
  return res.status(200).json({ message: "Display payees for dashboard" });
};

/**
 * * SHOW PAYEE:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const showPayee = async (req, res) => {
  return res.status(200).json({ message: "Show payees" });
};

/**
 * * EDIT PAYEE:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const editPayee = async (req, res) => {
  return res.status(200).json({ message: "Edit payees" });
};

/**
 * * REMOVE PAYEE:
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const removePayee = async (req, res) => {
  return res.status(200).json({ message: "Deactivated payee" });
};
