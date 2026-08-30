import { UserModel } from "../models/userModel.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { AppError } from "../utils/appError.js";

export class UserService {
  static async getUserById(userId) {
    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  static async updateUserProfile(userId, { name, phone }) {
    const updatedUser = await UserModel.updateProfile(
      userId,
      {
        name,
        phone,
      },
    );

    if (!updatedUser) {
      throw new AppError("User not found or update failed", 400);
    }

    return updatedUser;
  }

  static async changeUserPassword(
    userId,
    currentPassword,
    newPassword,
  ) {
    const user = await UserModel.getPasswordById(userId);
    if (!user) {
      throw new AppError("password not found", 404);
    }

    const isPasswordMatch = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new AppError("password lama salah", 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, hashedPassword);
    return true;
  }


  static async createAddress () {}
  static async getAddress () {}
  static async updateAddress () {}
  static async deleteAddress () {}

}
