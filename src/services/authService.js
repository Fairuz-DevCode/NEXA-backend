import { AuthModel } from "../models/authModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { AppError } from "../utils/appError.js";

export class AuthService {
  // Logika Register
  static async registerUser({ name, email, password }) {
    const userExists = await AuthModel.findByEmail(email);
    if (userExists) {
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await AuthModel.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await AuthModel.saveRefreshToken(
      newUser.id,
      refreshToken,
    );

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return { user, accessToken, refreshToken };
  }

  // Logika Login
  static async loginUser({ email, password }) {
    const userData = await AuthModel.findByEmail(email);
    if (!userData) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await comparePassword(
      password,
      userData.password,
    );
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const refreshToken = generateRefreshToken(userData);
    await AuthModel.saveRefreshToken(
      userData.id,
      refreshToken,
    );

    const accessToken = generateAccessToken(userData);

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
    };

    return { user, accessToken, refreshToken };
  }

  static async refreshTokenServices(refreshToken) {
    // Verifikasi JWT Signature
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError(
        "Invalid or expired refresh token",
        401,
      );
    }

    // Cek Keberadaan Token di Database
    const tokenInDb = await AuthModel.findRefreshToken(
      decoded.id,
      refreshToken,
    );

    if (!tokenInDb) {
      throw new AppError(
        "Invalid or expired refresh token",
        401,
      );
    }

    // Buat Access Token Baru
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    return { accessToken: newAccessToken };
  }

  static async logoutUser(refreshToken) {
    if (refreshToken) {
      await AuthModel.deleteRefreshToken(refreshToken);
    }
  }
}
