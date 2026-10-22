import pool from "../../config/db.js";
import { UserProfileResponse, UpdateProfileDTO } from "./user.types.js";

export class UserModel {
  static async getUserById(id: number): Promise<UserProfileResponse | null> {
    const result = await pool.query(
      "SELECT id, name, email, phone, role FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async getPasswordById(id: number): Promise<{ id: number; password: string } | null> {
    const result = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async updateProfile(id: number, { name, phone }: UpdateProfileDTO): Promise<UserProfileResponse | null> {
    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id, name, email, phone, role",
      [name || null, phone || null, id]
    );
    return result.rows[0] || null;
  }

  static async updatePassword(id: number, hashedPassword: string): Promise<any> {
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, id]
    );
    return result.rows[0] || null;
  }
}
