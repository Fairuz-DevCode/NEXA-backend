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
        return res.status(422).json({
          status: "fail",
          message: "validation failed",
          errors: validationError,
        });
      }

      const { user, accessToken, refreshToken } =
        await AuthService.registerUser(req.body);

      res.cookie(
        "refreshToken",
        refreshToken,
        cookiesOptions,
      );

      return res.status(201).json({
        status: "success",
        message: "Registration Succes",
        payload: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      if (error.message === "Email already registered") {
        return res.status(409).json({
          status: "fail",
          message: "Email already registered",
          errors: null,
        });
      }

      // Default Server Error (500)
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    }
  }

  static async login(req, res) {
    try {
      const validationError = validateLoginInput(req.body);

      if (validationError) {
        return res.status(422).json({
          status: "fail",
          message: "Validation failed",
          errors: validationError,
        });
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

      return res.status(200).json({
        status: "success",
        message: "Login successful",
        payload: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({
          status: "fail",
          message: "Invalid email or password",
          errors: null,
        });
      }

      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    }
  }

  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          status: "fail",
          message: "Refresh token missing or invalid",
          errors: "Invalid or expired refresh token",
        });
      }

      const { accessToken } =
        await AuthService.refreshTokenServices(
          refreshToken,
        );

      return res.json({
        status: "success",
        message: "Access token refreshed successfully",
        payload: accessToken,
      });
    } catch (error) {
      if (
        error.message ===
          "Refresh token tidak valid atau expired" ||
        error.message ===
          "Token sudah dicabut atau kadaluwarsa di DB" ||
        error.message === "Invalid refresh token" ||
        error.message === "Refresh token expired"
      ) {
        return res.status(401).json({
          status: "fail",
          message: "Refresh token missing or invalid",
          errors: "Invalid or expired refresh token",
        });
      }

      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    }
  }

  static async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          status: "fail",
          message: "Unauthorized access",
          errors:
            "User not authenticated or session already expired",
        });
      }

      await AuthService.logoutUser(refreshToken);

      res.clearCookie("refreshToken", cookiesOptions);

      return res.status(200).json({
        status: "success",
        message: "Logout successful",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    }
  }
}
