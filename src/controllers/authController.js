import { AuthService } from "../services/authService.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../validations/authValidation.js";

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
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

      const { user, token } =
        await AuthService.registerUser(req.body);

      res.cookie("token", token, cookiesOptions);
      return res.status(201).json({ user });
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

      const { user, token } = await AuthService.loginUser(
        req.body,
      );

      res.cookie("token", token, cookiesOptions);
      return res.json({ user });
    } catch (error) {
      return res
        .status(400)
        .json({ message: error.message });
    }
  }

  static async logout(req, res) {
    res.cookie("token", "", {
      ...cookiesOptions,
      maxAge: 1,
    });
    return res.json({ message: "Logged out succesfully" });
  }
}
