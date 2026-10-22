import pool from "../../config/db.js";
import redis from "../../config/redis.js";
import { UserInDB, UserRegisterDTO, UserResponse } from "./auth.types.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 hari dalam detik

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
    try {
      // 1. Simpan di Redis dengan TTL 7 hari
      await redis.set(`refresh_token:${userId}`, token, "EX", REFRESH_TOKEN_TTL);
    } catch (err) {
      console.warn("Redis saveRefreshToken error, fallback to PostgreSQL:", err);
    }

    // 2. Fallback simpan juga di DB PostgreSQL
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
    try {
      // Cek Redis terlebih dahulu (<1ms)
      const cachedToken = await redis.get(`refresh_token:${userId}`);
      if (cachedToken) {
        if (cachedToken === token) {
          return { user_id: userId, token };
        }
        return null;
      }
    } catch (err) {
      console.warn("Redis findRefreshToken error, fallback to PostgreSQL:", err);
    }

    // Fallback baca dari PostgreSQL jika key di Redis belum ada/miss
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2",
      [userId, token]
    );

    return result.rows[0] || null;
  }

  static async deleteRefreshToken(token: string): Promise<any> {
    try {
      // Hapus token di database PostgreSQL & invalidate di Redis
      const result = await pool.query(
        "DELETE FROM refresh_tokens WHERE token = $1 RETURNING user_id",
        [token]
      );
      if (result.rows.length > 0) {
        const userId = result.rows[0].user_id;
        await redis.del(`refresh_token:${userId}`);
      }
      return result.rows[0] || null;
    } catch {
      return null;
    }
  }
}
