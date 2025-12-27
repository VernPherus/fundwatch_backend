import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const protectRoute = async (res, req, next) => {
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

    //* Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectedRoute middleware: " + error.message);
    req.status(500).json({ message: "Internal server error." });
  }
};
