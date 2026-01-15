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
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //* Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    //* Check for password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.log("Error in login controller: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * LOGOUT:
 * @param {*} req
 * @param {*} res
 */
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in the logout controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
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
export const grantAdmin = async (req, res) => { };

/**
 * CHECK AUTH: Checks if current user is authenticated
 * @param {*} req
 * @param {*} res
 */
export const checkAuth = async (req, res) => {
  try {
    // req.user is set by the protectRoute middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth controller: " + error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
