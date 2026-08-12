import { UserModel } from "../models/userModel";
import { hashPassword } from "../utils/password";

export class UserService {
  static async getMyProfile(userId) {
    const user = await UserModel.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async updateMyProfile(
    userId,
    { name, phone, password },
  ) {
    let hashPassword = null;

    if (password) {
      const hashedPassword = await hashPassword(password);
    }

    const updateUser = await UserModel.update(userId, {
      name,
      phone,
      password: hashPassword,
    });

    if (!updateUser) {
      throw new Error("User not found or update failed");
    }

    return updateUser;
  }
}
