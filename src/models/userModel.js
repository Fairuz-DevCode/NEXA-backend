import pool from "../config/db.js";

export class UserModel {
  // Cek user berdasarkan ID
  static async findById(id) {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }

  static async update(id, { name, phone, password }) {
    const result = await pool.query(
      "UPDATE user SET name = COALESCE($1, name) phone = COALESCE($2, phone) password = COALESCE($3,password) WHERE id = $4 RETURNING id, name, phone, role",
      [name, phone, password, id],
    );
    return result.rows[0];
  }
}
