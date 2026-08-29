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

export class AuthService {
  // Logika Register
  static async registerUser({ name, email, password }) {
    const userExists = await AuthModel.findByEmail(email);
    if (userExists) {
      throw new Error("Email already registered");
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
      throw new Error("Invalid credentials");
    }

    const isMatch = await comparePassword(
      password,
      userData.password,
    );
    if (!isMatch) {
      throw new Error("Invalid credentials");
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
      throw new Error(
        "Refresh token tidak valid atau expired",
      );
    }

    // Cek Keberadaan Token di Database
    const tokenInDb = await AuthModel.findRefreshToken(
      decoded.id,
      refreshToken,
    );

    if (!tokenInDb) {
      throw new Error(
        "Token sudah dicabut atau kadaluwarsa di DB",
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
