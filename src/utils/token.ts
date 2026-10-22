import jwt from "jsonwebtoken";

export interface UserPayload {
  id: number;
  role: string;
  [key: string]: any;
}

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET || "default_access_secret",
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    { expiresIn: "7d" }
  );
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret"
    );
  } catch (error) {
    return null;
  }
};
