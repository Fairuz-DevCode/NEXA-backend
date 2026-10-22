import pool from "../../config/db.js";
import { UserInDB, UserRegisterDTO, UserResponse } from "./auth.types.js";

export class AuthModel {
  static async findByEmail(email: string): Promise<UserInDB | null> {
    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  static async createUser({ name, email, password }: UserRegisterDTO): Promise<UserResponse> {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
      [name, email, password]
    );
    return result.rows[0] || null;
  }

  static async saveRefreshToken(userId: number, token: string): Promise<any> {
    await pool.query(
      "DELETE FROM refresh_tokens WHERE user_id = $1 OR expires_at < NOW()",
      [userId]
    );

    const result = await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING *",
      [userId, token]
    );

    return result.rows[0] || null;
  }

  static async findRefreshToken(userId: number, token: string): Promise<any> {
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2",
      [userId, token]
    );

    return result.rows[0] || null;
  }

  static async deleteRefreshToken(token: string): Promise<any> {
    const result = await pool.query(
      "DELETE FROM refresh_tokens WHERE token = $1",
      [token]
    );

    return result.rows[0] || null;
  }
}
