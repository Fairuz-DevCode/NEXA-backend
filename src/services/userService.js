import { UserModel } from "../models/userModel.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

export class UserService {
  static async getUserById(userId) {
    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
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
      throw new Error("User not found or update failed");
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
      throw new Error("password not found");
    }

    const isPasswordMatch = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new Error("password lama salah");
    }

    const hashedPassword = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, hashedPassword);
    return true;
  }
}
