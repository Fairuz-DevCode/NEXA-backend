import { Request, Response, NextFunction } from "express";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied, admin only" });
  }
};
