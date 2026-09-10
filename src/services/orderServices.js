import pool from "../config/db.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import shippingModel from "../models/shippingModel.js";

const createError = (statusCode, message, errors = null, status = "fail") => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = status;
  err.errors = errors;
  return err;
};

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomStr}`;
};

export class orderServices {
  static async createOrder(userId, { address_id, shipping_cost }) {
    const address = await orderModel.getOrderAddress(null, address_id);
    if (!address) {
      throw createError(404, "Address not found");
    }

    const cart = await cartModel.getCartByUserId(null, userId);
    if (!cart) {
      throw createError(400, "Cart is empty or stock is insufficient");
    }

    const cartItems = await cartModel.getCartDetails(null, cart.id);
    if (!cartItems || cartItems.length === 0) {
      throw createError(400, "Cart is empty or stock is insufficient");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Verify stock for all items
      for (const item of cartItems) {
        const variant = await cartModel.checkVariantStock(client, item.product_variant_id);
        if (!variant || variant.stock < item.quantity) {
          throw createError(400, "Cart is empty or stock is insufficient");
        }
      }

      const itemsTotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );
      const totalAmount = itemsTotal + Number(shipping_cost);
      const orderNumber = generateOrderNumber();

      const newOrder = await orderModel.createOrder(client, {
        order_number: orderNumber,
        user_id: userId,
        address_id,
        total_amount: totalAmount,
        shipping_cost: Number(shipping_cost),
        status: "pending",
      });

      const orderItems = [];
      for (const item of cartItems) {
        const createdOrderItem = await orderModel.createOrderItem(client, {
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          size: item.size,
          price: Number(item.price),
          quantity: item.quantity,
        });

        await orderModel.deductVariantStock(client, item.product_variant_id, item.quantity);

        orderItems.push({
          id: createdOrderItem.id,
          product_id: createdOrderItem.product_id,
          product_name: createdOrderItem.product_name,
          size: createdOrderItem.size,
          price: Number(createdOrderItem.price),
          quantity: createdOrderItem.quantity,
        });
      }

      // Initialize shipping entry
      await shippingModel.createShipping(client, {
        order_id: newOrder.id,
        shipping_status: "pending",
      });

      // Clear user cart items
      await cartModel.clearCartItems(client, cart.id);

      await client.query("COMMIT");

      return {
        id: newOrder.id,
        order_number: newOrder.order_number,
        user_id: newOrder.user_id,
        address_id: newOrder.address_id,
        total_amount: Number(newOrder.total_amount),
        shipping_cost: Number(newOrder.shipping_cost),
        status: newOrder.status,
        created_at: newOrder.created_at,
        items: orderItems,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserOrders(userId) {
    const orders = await orderModel.getUserOrders(null, userId);
    return orders.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      total_amount: Number(o.total_amount),
      status: o.status,
      created_at: o.created_at,
    }));
  }

  static async getOrderDetail(userId, orderId, userRole = "customer") {
    const order = await orderModel.getOrderById(null, orderId);
    if (!order || (order.user_id !== userId && userRole !== "admin")) {
      throw createError(404, "Order not found");
    }

    const address = await orderModel.getOrderAddress(null, order.address_id);
    const items = await orderModel.getOrderItems(null, order.id);

    return {
      id: order.id,
      order_number: order.order_number,
      total_amount: Number(order.total_amount),
      shipping_cost: Number(order.shipping_cost),
      status: order.status,
      created_at: order.created_at,
      address: address
        ? {
            label: address.label,
            phone: address.phone,
            street_address: address.street_address,
            city: address.city,
            postal_code: address.postal_code,
            country: address.country,
          }
        : null,
      items: items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        size: item.size,
        price: Number(item.price),
        quantity: item.quantity,
      })),
    };
  }

  static async cancelOrder(userId, orderId) {
    const order = await orderModel.getOrderById(null, orderId);
    if (!order || order.user_id !== userId) {
      throw createError(404, "Order not found");
    }

    if (order.status === "shipped" || order.status === "completed") {
      throw createError(400, "Cannot cancel order that has already been shipped or completed");
    }

    if (order.status === "cancel") {
      return {
        id: order.id,
        order_number: order.order_number,
        status: "cancel",
      };
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await orderModel.restoreStockForOrder(client, order.id);
      const updated = await orderModel.updateOrderStatus(client, order.id, "cancel");
      await client.query("COMMIT");

      return {
        id: updated.id,
        order_number: updated.order_number,
        status: updated.status,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
