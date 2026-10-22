import { Request, Response, NextFunction } from "express";
import { OrderServices } from "./order.service.js";

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const order = await OrderServices.createOrder(userId, req.body);
      return res.status(201).json({
        status: "success",
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orders = await OrderServices.getUserOrders(userId);
      return res.status(200).json({
        status: "success",
        message: "Order history fetched successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.id as string, 10);
      const userRole = req.user!.role || "customer";
      const orderDetail = await OrderServices.getOrderDetail(userId, orderId, userRole);
      return res.status(200).json({
        status: "success",
        message: "Order details fetched successfully",
        data: orderDetail,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orderId = parseInt(req.params.id as string, 10);
      const cancelledOrder = await OrderServices.cancelOrder(userId, orderId);
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
