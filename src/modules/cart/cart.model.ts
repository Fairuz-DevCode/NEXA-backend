import pool from "../../config/db.js";

export class CartModel {
  static async findOrCreateCart(client: any, userId: number): Promise<{ id: number; user_id: number }> {
    const dbClient = client || pool;
    let result = await dbClient.query(
      `SELECT id, user_id FROM carts WHERE user_id = $1 LIMIT 1;`,
      [userId]
    );

    if (result.rows.length === 0) {
      result = await dbClient.query(
        `INSERT INTO carts (user_id) VALUES ($1) RETURNING id, user_id;`,
        [userId]
      );
    }

    return result.rows[0];
  }

  static async getCartByUserId(client: any, userId: number): Promise<{ id: number; user_id: number } | null> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, user_id FROM carts WHERE user_id = $1 LIMIT 1;`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async findCartItem(client: any, cartId: number, productVariantId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, cart_id, product_id, product_variant_id, quantity FROM cart_items WHERE cart_id = $1 AND product_variant_id = $2;`,
      [cartId, productVariantId]
    );
    return result.rows[0] || null;
  }

  static async findCartItemById(client: any, itemId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT ci.id, ci.cart_id, ci.product_id, ci.product_variant_id, ci.quantity, c.user_id 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1;`,
      [itemId]
    );
    return result.rows[0] || null;
  }

  static async addCartItem(client: any, cartId: number, productId: number, productVariantId: number, quantity: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO cart_items (cart_id, product_id, product_variant_id, quantity) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, cart_id, product_id, product_variant_id, quantity;`,
      [cartId, productId, productVariantId, quantity]
    );
    return result.rows[0];
  }

  static async updateCartItemQuantity(client: any, itemId: number, quantity: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING id, cart_id, product_id, product_variant_id, quantity;`,
      [quantity, itemId]
    );
    return result.rows[0] || null;
  }

  static async removeCartItem(client: any, itemId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `DELETE FROM cart_items WHERE id = $1 RETURNING id;`,
      [itemId]
    );
    return result.rows[0] || null;
  }

  static async getCartDetails(client: any, cartId: number): Promise<any[]> {
    const dbClient = client || pool;
    const query = `
      SELECT 
        ci.id,
        ci.product_id,
        p.name AS product_name,
        p.img_url AS product_img_url,
        ci.product_variant_id,
        pv.size,
        p.price,
        ci.quantity,
        (p.price * ci.quantity) AS subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC;
    `;
    const result = await dbClient.query(query, [cartId]);
    return result.rows;
  }

  static async clearCartItems(client: any, cartId: number): Promise<void> {
    const dbClient = client || pool;
    await dbClient.query(`DELETE FROM cart_items WHERE cart_id = $1;`, [cartId]);
  }

  static async checkVariantStock(client: any, variantId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, product_id, size, stock FROM product_variants WHERE id = $1;`,
      [variantId]
    );
    return result.rows[0] || null;
  }
}
