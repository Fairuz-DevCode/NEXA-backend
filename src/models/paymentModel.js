import pool from "../config/db.js";

export default class paymentModel {
  static async createPayment(
    client,
    { order_id, payment_type, transaction_status = "pending", payment_url }
  ) {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO payments (order_id, payment_type, transaction_status, payment_url, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, order_id, payment_type, transaction_status, payment_url, created_at;`,
      [order_id, payment_type, transaction_status, payment_url]
    );
    return result.rows[0];
  }

  static async getPaymentByOrderId(client, orderId) {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, order_id, payment_type, transaction_status, payment_url, created_at 
       FROM payments 
       WHERE order_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1;`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  static async updatePaymentStatus(client, orderId, transaction_status) {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE payments 
       SET transaction_status = $1 
       WHERE order_id = $2 
       RETURNING id, order_id, payment_type, transaction_status, payment_url, created_at;`,
      [transaction_status, orderId]
    );
    return result.rows[0] || null;
  }
}
