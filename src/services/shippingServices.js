import shippingModel from "../models/shippingModel.js";
import orderModel from "../models/orderModel.js";
import pool from "../config/db.js";

const createError = (statusCode, message, errors = null, status = "fail") => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = status;
  err.errors = errors;
  return err;
};

export class shippingServices {
  static async updateShippingStatus(orderId, { courier, tracking_number, shipping_status }) {
    const order = await orderModel.getOrderById(null, orderId);
    if (!order) {
      throw createError(404, "Order not found");
    }

    if (order.status !== "paid" && order.status !== "shipped" && order.status !== "completed") {
      throw createError(400, "Order must be paid before updating shipping status");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Normalize status if passed 'shipped' to match internal/DB tracking state
      const dbStatus = shipping_status === "shipped" ? "in_transit" : shipping_status;

      const shipping = await shippingModel.upsertShipping(client, orderId, {
        courier,
        tracking_number,
        shipping_status: dbStatus,
      });

      // Update order status to shipped
      await orderModel.updateOrderStatus(client, orderId, "shipped");

      await client.query("COMMIT");

      return {
        order_id: Number(shipping.order_id),
        courier: shipping.courier,
        tracking_number: shipping.tracking_number,
        shipping_status: shipping_status === "in_transit" ? "shipped" : shipping.shipping_status,
        shipped_at: shipping.shipped_at || new Date().toISOString(),
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async getShippingDetail(userId, orderId, userRole = "customer") {
    const order = await orderModel.getOrderById(null, orderId);
    if (!order || (order.user_id !== userId && userRole !== "admin")) {
      throw createError(404, "Shipping information not found");
    }

    const shipping = await shippingModel.getShippingByOrderId(null, orderId);
    if (!shipping) {
      throw createError(404, "Shipping information not found");
    }

    return {
      order_id: Number(shipping.order_id),
      courier: shipping.courier === "PENDING" ? null : shipping.courier,
      tracking_number: shipping.tracking_number,
      shipping_status: shipping.shipping_status === "in_transit" ? "shipped" : shipping.shipping_status,
      shipped_at: shipping.shipped_at,
      delivered_at: shipping.shipping_status === "delivered" ? shipping.shipped_at : null,
    };
  }

  static async confirmOrderReceived(userId, orderId) {
    const order = await orderModel.getOrderById(null, orderId);
    if (!order || order.user_id !== userId) {
      throw createError(404, "Order not found");
    }

    const shipping = await shippingModel.getShippingByOrderId(null, orderId);
    if (!shipping || (shipping.shipping_status !== "in_transit" && shipping.shipping_status !== "shipped" && order.status !== "shipped")) {
      throw createError(400, "Cannot complete order before it is shipped");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await shippingModel.markAsDelivered(client, orderId);
      await orderModel.updateOrderStatus(client, orderId, "completed");

      await client.query("COMMIT");

      const deliveredAt = new Date().toISOString();
      return {
        order_id: Number(orderId),
        shipping_status: "delivered",
        order_status: "completed",
        delivered_at: deliveredAt,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // Extensible helper method for calculating shipping rates from third-party shipping APIs (e.g. RajaOngkir/Binderbyte)
  static async calculateShippingCost({ destination_city, weight = 1000, courier = "JNE" }) {
    // Placeholder logic for dynamic shipping API integration
    const baseCost = 20000;
    return {
      courier,
      service: "REG",
      cost: baseCost,
      estimated_days: "2-3",
    };
  }
}
