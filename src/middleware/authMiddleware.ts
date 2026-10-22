import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../utils/token.js";

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
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
      process.env.JWT_ACCESS_SECRET || "default_access_secret"
    ) as UserPayload;

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Not authorized, token failed or expired",
    });
  }
};
