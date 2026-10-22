import pool from "../../config/db.js";

export class ReviewModel {
  static async getReviewsByProduct(productId: number) {
    const query = `
      SELECT r.id, r.product_id, r.rating, r.comment, r.created_at,
             u.name as user_name
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  }

  static async addReview(userId: number, productId: number, rating: number, comment?: string) {
    const query = `
      INSERT INTO product_reviews (user_id, product_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, productId, rating, comment]);
    return result.rows[0];
  }

  static async getAverageRating(productId: number) {
    const query = `
      SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews
      FROM product_reviews
      WHERE product_id = $1;
    `;
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  }
}
