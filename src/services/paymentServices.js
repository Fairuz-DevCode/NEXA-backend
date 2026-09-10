import crypto from "crypto";
import paymentModel from "../models/paymentModel.js";
import orderModel from "../models/orderModel.js";
import { snap } from "../config/midtrans.js";
import pool from "../config/db.js";

const createError = (statusCode, message, errors = null, status = "fail") => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = status;
  err.errors = errors;
  return err;
};

export class paymentServices {
  static async createPayment(userId, { order_id, payment_type }) {
    const order = await orderModel.getOrderById(null, order_id);
    if (!order || order.user_id !== userId) {
      throw createError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw createError(400, "Payment transaction already exists for this order or order is invalid");
    }

    const existingPayment = await paymentModel.getPaymentByOrderId(null, order_id);
    if (existingPayment && existingPayment.transaction_status === "settlement") {
      throw createError(400, "Payment transaction already exists for this order or order is invalid");
    }

    let paymentUrl = "";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (serverKey && serverKey !== "SB-Mid-server-placeholder") {
      try {
        const parameter = {
          transaction_details: {
            order_id: `${order.order_number}-${Date.now()}`,
            gross_amount: Number(order.total_amount),
          },
          payment_type: payment_type,
          credit_card: {
            secure: true,
          },
        };
        const transaction = await snap.createTransaction(parameter);
        paymentUrl = transaction.redirect_url;
      } catch (midtransErr) {
        console.error("Midtrans Snap error, fallback to sandbox URL structure:", midtransErr);
        paymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${crypto.randomBytes(8).toString("hex")}`;
      }
    } else {
      // Mock Sandbox URL for development when API key is not yet set
      paymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${crypto.randomBytes(8).toString("hex")}`;
    }

    let paymentRecord;
    if (existingPayment) {
      paymentRecord = await paymentModel.updatePaymentStatus(null, order_id, "pending");
    } else {
      paymentRecord = await paymentModel.createPayment(null, {
        order_id,
        payment_type,
        transaction_status: "pending",
        payment_url: paymentUrl,
      });
    }

    return {
      id: paymentRecord.id,
      order_id: paymentRecord.order_id,
      payment_type: paymentRecord.payment_type,
      transaction_status: paymentRecord.transaction_status,
      payment_url: paymentRecord.payment_url,
      created_at: paymentRecord.created_at,
    };
  }

  static async processNotification(payload) {
    const { order_id, transaction_status, payment_type, signature_key, gross_amount, status_code } = payload || {};

    if (!order_id || !transaction_status) {
      throw createError(400, "Invalid signature or payload");
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && serverKey !== "SB-Mid-server-placeholder" && signature_key && gross_amount && status_code) {
      const hash = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (hash !== signature_key) {
        throw createError(400, "Invalid signature or payload");
      }
    }

    // Extract original order_number (handle suffix appended during snap creation if any)
    const cleanOrderNumber = order_id.split("-").slice(0, 3).join("-");
    let order = await orderModel.getOrderByNumber(null, cleanOrderNumber);

    if (!order) {
      // try looking up order directly by numeric order_id if passed
      if (!isNaN(cleanOrderNumber)) {
        order = await orderModel.getOrderById(null, parseInt(cleanOrderNumber, 10));
      }
    }

    if (!order) {
      throw createError(400, "Invalid signature or payload");
    }

    let mappedPaymentStatus = "pending";
    let targetOrderStatus = order.status;

    if (transaction_status === "settlement" || transaction_status === "capture") {
      mappedPaymentStatus = "settlement";
      targetOrderStatus = "paid";
    } else if (transaction_status === "expire") {
      mappedPaymentStatus = "expire";
      targetOrderStatus = "cancel";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      mappedPaymentStatus = "cancel";
      targetOrderStatus = "cancel";
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await paymentModel.updatePaymentStatus(client, order.id, mappedPaymentStatus);

      if (targetOrderStatus === "paid" && order.status !== "paid") {
        await orderModel.updateOrderStatus(client, order.id, "paid");
      } else if (targetOrderStatus === "cancel" && order.status !== "cancel") {
        await orderModel.restoreStockForOrder(client, order.id);
        await orderModel.updateOrderStatus(client, order.id, "cancel");
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async getPaymentDetail(userId, orderId, userRole = "customer") {
    const order = await orderModel.getOrderById(null, orderId);
    if (!order || (order.user_id !== userId && userRole !== "admin")) {
      throw createError(404, "Payment details not found");
    }

    const payment = await paymentModel.getPaymentByOrderId(null, orderId);
    if (!payment) {
      throw createError(404, "Payment details not found");
    }

    return {
      id: payment.id,
      order_id: payment.order_id,
      payment_type: payment.payment_type,
      transaction_status: payment.transaction_status,
      payment_url: payment.payment_url,
      created_at: payment.created_at,
    };
  }
}
