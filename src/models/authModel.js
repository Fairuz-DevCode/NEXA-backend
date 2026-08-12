import pool from "../config/db.js";

export class AuthModel {
  // Cek user berdasarkan email
  static async findByEmail(email) {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0];
  }

  // Insert user baru
  static async create({ name, email, password }) {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, password],
    );
    return result.rows[0];
  }
}
