import { orderServices } from "../services/orderServices.js";

export default class orderController {
  static async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const order = await orderServices.createOrder(userId, req.body);
      return res.status(201).json({
        status: "success",
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await orderServices.getUserOrders(userId);
      return res.status(200).json({
        status: "success",
        message: "Order history fetched successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.id, 10);
      const userRole = req.user.role || "customer";
      const orderDetail = await orderServices.getOrderDetail(userId, orderId, userRole);
      return res.status(200).json({
        status: "success",
        message: "Order details fetched successfully",
        data: orderDetail,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.id, 10);
      const cancelledOrder = await orderServices.cancelOrder(userId, orderId);
      return res.status(200).json({
        status: "success",
        message: "Order cancelled successfully",
        data: cancelledOrder,
      });
    } catch (error) {
      next(error);
    }
  }
}
