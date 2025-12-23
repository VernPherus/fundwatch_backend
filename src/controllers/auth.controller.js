import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

/**
 * SIGNUP: Create a user and store into database
 * @param {*} req
 * @param {*} res
 */
export const signup = async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  try {
    //* Check for empty fields
    if (!username || !firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    //* Check if user already exists
    const user = await prisma.user.findFirst({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    //* Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user

  } catch (error) {
    console.log("Error in signup controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
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
  try {
    const allUsers = await prisma.user.findMany();
    res.status(201).json({
      allUsers,
    });
  } catch (error) {
    console.log("Error in signup controller: " + error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * CHECK AUTH: Checks if current user is authenticated
 * @param {*} req
 * @param {*} res
 */
export const checkAuth = async (req, res) => {};
