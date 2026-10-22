import pool from "../../config/db.js";

export class WishlistModel {
  static async getWishlist(userId: number) {
    const query = `
      SELECT w.id, w.product_id, w.created_at,
             p.name, p.slug, p.price, p.img_url, c.name as category_name
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async toggleWishlist(userId: number, productId: number) {
    const checkQuery = `SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2;`;
    const existing = await pool.query(checkQuery, [userId, productId]);

    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2;`, [userId, productId]);
      return { inWishlist: false };
    } else {
      await pool.query(
        `INSERT INTO wishlists (user_id, product_id, created_at) VALUES ($1, $2, NOW());`,
        [userId, productId]
      );
      return { inWishlist: true };
    }
  }
}
