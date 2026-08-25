import { AuthService } from "../services/authService.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../validations/authValidation.js";

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  static async register(req, res) {
    try {
      const validationError = validateRegisterInput(
        req.body,
      );

      if (validationError) {
        return res
          .status(400)
          .json({ message: validationError });
      }

      const { user, accessToken, refreshToken } =
        await AuthService.registerUser(req.body);

      res.cookie(
        "refreshToken",
        refreshToken,
        cookiesOptions,
      );

      return res.status(201).json({
        status : "succes",
        message: "Registrasi Berhasil",
        data : {
          user,
          accessToken,
        }
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const validationError = validateLoginInput(req.body);
      if (validationError) {
        return res
          .status(400)
          .json({ message: validationError });
      }

      const { user, accessToken, refreshToken } =
        await AuthService.loginUser({
          email: req.body.email,
          password: req.body.password,
        });

      res.cookie(
        "refreshToken",
        refreshToken,
        cookiesOptions,
      );

      return res.json({
        user,
        message: "Login Berhasil",
        accessToken,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: error.message });
    }
  }

  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          message: "Refresh token tidak ditemukan",
        });
      }

      const { accessToken } =
        await AuthService.refreshTokenServices(
          refreshToken,
        );

      return res.json({
        message: "refresh access token",
        accessToken,
      });
    } catch (error) {
      return res
        .status(403)
        .json({ message: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await AuthService.logoutUser(refreshToken);
      }

      res.clearCookie("refreshToken", cookiesOptions);

      return res.json({
        message: "Logged out successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message });
    }
  }
}
