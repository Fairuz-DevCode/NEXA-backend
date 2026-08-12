import { AuthModel } from "../models/authModel.js";
import { generateToken } from "../utils/token.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

export class AuthService {
  // Logika Register
  static async registerUser({ name, email, password }) {
    const userExists = await AuthModel.findByEmail(email);
    if (userExists) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await AuthModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser.id);
    return { user: newUser, token };
  }

  // Logika Login
  static async loginUser({ email, password }) {
    const userData = await AuthModel.findByEmail(email);
    if (!userData) {
      throw new Error("invalid credential");
    }

    const isMatch = await comparePassword(
      password,
      userData.password,
    );
    if (!isMatch) {
      throw new Error("invalid cedentials");
    }

    const token = generateToken(userData.id);
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
    };

    return { user, token };
  }
}
