import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

/**
 ** SIGNUP: Create a user and store into database
 * @param {*} req
 * @param {*} res
 */
export const signup = async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    //* Check for empty fields
    if (!username || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters." });
    }

    //* Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    //* Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //* Database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          username,
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      // Create log
      await tx.logs.create({
        data: {
          userId: newUser.id,
          log: `New user registration: ${username}`,
        },
      });

      return newUser;
    });

    if (result) {
      generateToken(result.id, res);

      res.status(201).json({
        id: result.id,
        username: result.username,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      });
    }
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
 * GRANT ADMIN: Updates user role to admin
 * @param {*} req 
 * @param {*} res 
 */
export const grantAdmin = async (req, res) => {
  
}

/**
 * CHECK AUTH: Checks if current user is authenticated
 * @param {*} req
 * @param {*} res
 */
export const checkAuth = async (req, res) => {};
