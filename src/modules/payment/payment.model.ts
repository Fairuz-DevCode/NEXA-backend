import pool from "../../config/db.js";

export class PaymentModel {
  static async createPayment(
    client: any,
    { order_id, payment_type, transaction_status = "pending", payment_url }: {
      order_id: number;
      payment_type: string;
      transaction_status?: string;
      payment_url: string;
    }
  ): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO payments (order_id, payment_type, transaction_status, payment_url, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, order_id, payment_type, transaction_status, payment_url, created_at;`,
      [order_id, payment_type, transaction_status, payment_url]
    );
    return result.rows[0];
  }

  static async getPaymentByOrderId(client: any, orderId: number): Promise<any> {
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

  static async updatePaymentStatus(client: any, orderId: number, transaction_status: string): Promise<any> {
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
