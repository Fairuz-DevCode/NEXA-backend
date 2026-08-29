import { UserService } from "../services/userService.js";
import {
  validateUpdateUser,
  validateChangePassword,
} from "../validations/userValidation.js";

export class UserController {
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
          errors: null,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const validationError = validateUpdateUser(req.body);

      if (validationError) {
        return res.status(422).json({
          status: "fail",
          message: "Validation failed",
          errors: validationError,
        });
      }

      const userId = req.user.id;
      const { name, phone } = req.body;

      if (!name && !phone) {
        return res.status(400).json({
          status: "fail",
          message: "setidaknya 1 harus di rubah",
          errors: null,
        });
      }

      const updatedUser =
        await UserService.updateUserProfile(userId, {
          name,
          phone,
        });

      return res.status(200).json({
        status: "success",
        message: "User profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const validationError = validateChangePassword(
        req.body,
      );

      if (validationError) {
        return res.status(422).json({
          status: "fail",
          message: "Validation failed",
          errors: validationError,
        });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: "fail",
          message:
            "password lama dan password baru harus diisi",
          errors: null,
        });
      }

      await UserService.changeUserPassword(
        userId,
        currentPassword,
        newPassword,
      );

      return res.status(200).json({
        status: "success",
        message: "Password berhasil dirubah",
      });
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: error.message,
        errors: null,
      });
    }
  }
}
