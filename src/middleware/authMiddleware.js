import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no access token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Not authorized, token failed or expired",
    });
  }
};
