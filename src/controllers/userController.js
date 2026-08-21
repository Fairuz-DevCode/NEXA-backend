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
        return res
          .status(404)
          .json({ message: "user tidak ditemukan" });
      }

      return res
        .status(200)
        .json({ status: "succes get profile", data: user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "Server Error" });
    }
  }

  static async updateProfile(req, res) {
    try {
      const validationError = validateUpdateUser(req.body);

      if (validationError) {
        return res
          .status(400)
          .json({ message: validationError });
      }

      const userId = req.user.id;
      const { name, phone } = req.body;

      if (!name && !phone) {
        return res
          .status(400)
          .json({ message: "setidaknya 1 harus di rubah" });
      }

      const updatedUser =
        await UserService.updateUserProfile(userId, {
          name,
          phone,
        });

      return res.status(200).json({
        status: "success update profile",
        data: updatedUser,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "Server Error" });
    }
  }

  static async changePassword(req, res) {
    try {
      const validationError = validateChangePassword(
        req.body,
      );

      if (validationError) {
        return res
          .status(400)
          .json({ message: validationError });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message:
            "password lama dan password baru harus diisi",
        });
      }

      await UserService.changeUserPassword(
        userId,
        currentPassword,
        newPassword,
      );

      return res.status(200).json({
        status: "succes",
        message: "Password berhasil dirubah",
      });
    } catch (error) {
      return res
        .status(400)
        .json({ status: "fail", message: error.message });
    }
  }
}
