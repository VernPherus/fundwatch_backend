import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const protectRoute = async (req, res, next) => {
  try {
    //* Check if token exists
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - invalid token." });
    }

    //* Verify if token is valid
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized - invalid token." });
    }

    //* Check if user exists - use userId from token (not id)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: { id: true, role: true, firstName: true, lastName: true, email: true, username: true },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectedRoute middleware: " + error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not identified." });
    }

    //* Check if allowed roles are included
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Forbidden - You do not have permission to perform this action",
      });
    }

    next();
  };
};
