import { Request, Response, NextFunction } from "express";
import redis from "../config/redis.js";

export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const windowSeconds = Math.ceil(options.windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `ratelimit:${ip}`;

    try {
      // Menggunakan atomic INCR Redis
      const current = await redis.incr(key);

      // Jika pertama kali dibuat, set TTL
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > options.max) {
        return res.status(429).json({
          status: "error",
          message: options.message || "Too many requests, please try again later.",
        });
      }

      next();
    } catch {
      // Fallback jika Redis bermasalah, request tetap diperbolehkan
      next();
    }
  };
};

export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
};
