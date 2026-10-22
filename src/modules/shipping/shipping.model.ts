import pool from "../../config/db.js";

export class ShippingModel {
  static async createShipping(
    client: any,
    { order_id, courier_name = "PENDING", tracking_number = null, shipping_status = "pending" }: {
      order_id: number;
      courier_name?: string;
      tracking_number?: string | null;
      shipping_status?: string;
    }
  ): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO shippings (order_id, courier_name, tracking_number, shipping_status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_id, courier_name AS courier, tracking_number, shipping_status;`,
      [order_id, courier_name, tracking_number, shipping_status]
    );
    return result.rows[0];
  }

  static async getShippingByOrderId(client: any, orderId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `SELECT id, order_id, courier_name AS courier, tracking_number, shipping_status, shipped_at 
       FROM shippings 
       WHERE order_id = $1 
       LIMIT 1;`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  static async upsertShipping(
    client: any,
    orderId: number,
    { courier, tracking_number, shipping_status }: {
      courier: string;
      tracking_number: string;
      shipping_status: string;
    }
  ): Promise<any> {
    const dbClient = client || pool;
    const existing = await this.getShippingByOrderId(dbClient, orderId);
    let shippedAt = shipping_status === "shipped" || shipping_status === "in_transit" ? new Date() : null;

    if (existing) {
      const result = await dbClient.query(
        `UPDATE shippings 
         SET courier_name = $1, tracking_number = $2, shipping_status = $3, 
             shipped_at = COALESCE(shipped_at, $4) 
         WHERE order_id = $5 
         RETURNING order_id, courier_name AS courier, tracking_number, shipping_status, shipped_at;`,
        [courier, tracking_number, shipping_status, shippedAt, orderId]
      );
      return result.rows[0];
    } else {
      const result = await dbClient.query(
        `INSERT INTO shippings (order_id, courier_name, tracking_number, shipping_status, shipped_at) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING order_id, courier_name AS courier, tracking_number, shipping_status, shipped_at;`,
        [orderId, courier, tracking_number, shipping_status, shippedAt]
      );
      return result.rows[0];
    }
  }

  static async markAsDelivered(client: any, orderId: number): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE shippings 
       SET shipping_status = 'delivered' 
       WHERE order_id = $1 
       RETURNING order_id, courier_name AS courier, tracking_number, shipping_status, shipped_at;`,
      [orderId]
    );
    return result.rows[0] || null;
  }
}
