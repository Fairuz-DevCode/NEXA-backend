import pool from "../config/db.js";

export default class categoriesModels {
  static async createCategories({
    name,
    slug,
    parent_id = null,
  }) {
    const result = await pool.query(
      `INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING id, name, slug, parent_id;`,
      [name, slug, parent_id],
    );
    return result.rows[0] || null;
  }

  static async getCategoryBySlug(slug) {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE slug = $1;`,
      [slug],
    );
    return result.rows[0] || null;
  }

  static async getAllCategories() {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories ORDER BY id ASC;`,
    );
    return result.rows || [];
  }

  static async getCategoriesById(id) {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE id = $1;`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async deleteCategories(id) {
    const result = await pool.query(
      `DELETE FROM categories WHERE id = $1 RETURNING id;`,
      [id],
    );
    return result.rows[0] || null;
  }
}