import { UserService } from "../services/userService.js";
import {
  validateUpdateUser,
  validateChangePassword,
} from "../validations/userValidation.js";
import { AppError } from "../utils/appError.js";

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return res.status(200).json({
        status: "success",
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const validationError = validateUpdateUser(req.body);

      if (validationError) {
        throw new AppError("Validation failed", 422, validationError);
      }

      const userId = req.user.id;
      const { name, phone } = req.body;

      if (!name && !phone) {
        throw new AppError("setidaknya 1 harus di rubah", 400);
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
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const validationError = validateChangePassword(
        req.body,
      );

      if (validationError) {
        throw new AppError("Validation failed", 422, validationError);
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError("password lama dan password baru harus diisi", 400);
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
      next(error);
    }
  }
}
