import pool from "../../config/db.js";

export class OrderModel {
  static async createOrder(
    client: any,
    { order_number, user_id, address_id, total_amount, shipping_cost, status = "pending" }: {
      order_number: string;
      user_id: number;
      address_id: number;
      total_amount: number;
      shipping_cost: number;
      status?: string;
    }
  ): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO orders (order_number, user_id, address_id, total_amount, shipping_cost, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, order_number, user_id, address_id, total_amount, shipping_cost, status, created_at;`,
      [order_number, user_id, address_id, total_amount, shipping_cost, status]
    );
    return result.rows[0];
  }

  static async createOrderItem(
    client: any,
    { order_id, product_id, product_name, size, price, quantity }: {
      order_id: number;
      product_id: number;
      product_name: string;
      size: string;
      price: number;
      quantity: number;
    }
  ): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO order_items (order_id, product_id, product_name, size, price, quantity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, order_id, product_id, product_name, size, price, quantity;`,
      [order_id, product_id, product_name, size, price, quantity]
    );
    return result.rows[0];
  }

  static async deductVariantStock(client: any, variantId: number, quantity: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE product_variants 
       SET stock = stock - $1 
       WHERE id = $2 AND stock >= $1 
       RETURNING id, stock;`,
      [quantity, variantId]
    );
    return result.rows[0] || null;
  }

  static async restoreStockForOrder(client: any, orderId: number): Promise<void> {
    const dbClient = client || pool;
    const items = await dbClient.query(
      `SELECT oi.product_id, oi.size, oi.quantity 
       FROM order_items oi 
       WHERE oi.order_id = $1;`,
      [orderId]
    );

    for (const item of items.rows) {
      await dbClient.query(
        `UPDATE product_variants 
         SET stock = stock + $1 
         WHERE product_id = $2 AND size = $3;`,
        [item.quantity, item.product_id, item.size]
      );
    }
  }

  static async getUserOrders(client: any, userId: number): Promise<any[]> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, order_number, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC;`,
      [userId]
    );
    return result.rows;
  }

  static async getOrderById(client: any, orderId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, order_number, user_id, address_id, total_amount, shipping_cost, status, created_at 
       FROM orders 
       WHERE id = $1;`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  static async getOrderByNumber(client: any, orderNumber: string): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, order_number, user_id, address_id, total_amount, shipping_cost, status, created_at 
       FROM orders 
       WHERE order_number = $1;`,
      [orderNumber]
    );
    return result.rows[0] || null;
  }

  static async getOrderItems(client: any, orderId: number): Promise<any[]> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, product_id, product_name, size, price, quantity 
       FROM order_items 
       WHERE order_id = $1 
       ORDER BY id ASC;`,
      [orderId]
    );
    return result.rows;
  }

  static async getOrderAddress(client: any, addressId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT label, phone, street_address, city, postal_code, country 
       FROM addresses 
       WHERE id = $1;`,
      [addressId]
    );
    return result.rows[0] || null;
  }

  static async updateOrderStatus(client: any, orderId: number, status: string): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, order_number, status;`,
      [status, orderId]
    );
    return result.rows[0] || null;
  }
}
