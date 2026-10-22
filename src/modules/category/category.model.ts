import pool from "../../config/db.js";
import { CategoryResponse, CreateCategoryDTO } from "./category.types.js";

export class CategoryModel {
  static async createCategories({
    name,
    slug,
    parent_id = null,
  }: {
    name: string;
    slug: string;
    parent_id?: number | null;
  }): Promise<CategoryResponse | null> {
    const result = await pool.query(
      `INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING id, name, slug, parent_id;`,
      [name, slug, parent_id]
    );
    return result.rows[0] || null;
  }

  static async getCategoryBySlug(slug: string): Promise<CategoryResponse | null> {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE slug = $1;`,
      [slug]
    );
    return result.rows[0] || null;
  }

  static async getAllCategories(): Promise<CategoryResponse[]> {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories ORDER BY id ASC;`
    );
    return result.rows || [];
  }

  static async getCategoriesById(id: number | string): Promise<CategoryResponse | null> {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE id = $1;`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async deleteCategories(id: number | string): Promise<any> {
    const result = await pool.query(
      `DELETE FROM categories WHERE id = $1 RETURNING id;`,
      [id]
    );
    return result.rows[0] || null;
  }
}
