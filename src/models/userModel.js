import pool from "../config/db.js";

export class UserModel {
  // Cek user berdasarkan ID
  static async getUserById(id) {
    const result = await pool.query(
      "SELECT id, name, email, phone FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  }

  static async getPasswordById(id) {
    const result = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  }

  static async updateProfile(id, { name, phone }) {
    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id, name, phone",
      [name || null, phone || null, id],
    );
    return result.rows[0] || null;
  }

  static async updatePassword(id, hashedPassword) {
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, id],
    );
    return result.rows[0] || null;
  }
}
