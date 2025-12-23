import {prisma} from "../lib/prisma"

/**
 * SIGNUP: Create a user and store into database
 * @param {*} req 
 * @param {*} res 
 */
export const signup = (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  res.send("signup route");
};

/**
 * LOGIN:
 * @param {*} req 
 * @param {*} res 
 */
export const login = (req, res) => {
  res.send("login route");
};

/**
 * LOGOUT:
 * @param {*} req 
 * @param {*} res 
 */
export const logout = (req, res) => {
  res.send("logout route");
};

/**
 * SHOW USERS: Displays all users
 * @param {*} req 
 * @param {*} res 
 */
export const showUsers = async (req, res) => {

  const allUsers = await prisma.user.findMany();
  res.status(201).json({
    allUsers
  })
};

/**
 * CHECK AUTH: Checks if current user is authenticated
 * @param {*} req 
 * @param {*} res 
 */
export const checkAuth = async (req, res) => {
  
}