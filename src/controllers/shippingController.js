import { shippingServices } from "../services/shippingServices.js";

export default class shippingController {
  static async updateShipping(req, res, next) {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const data = await shippingServices.updateShippingStatus(orderId, req.body);
      return res.status(200).json({
        status: "success",
        message: "Shipping information updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getShipping(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.orderId, 10);
      const userRole = req.user.role || "customer";
      const data = await shippingServices.getShippingDetail(userId, orderId, userRole);
      return res.status(200).json({
        status: "success",
        message: "Shipping details fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.orderId, 10);
      const data = await shippingServices.confirmOrderReceived(userId, orderId);
      return res.status(200).json({
        status: "success",
        message: "Order completed successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async calculateCost(req, res, next) {
    try {
      const data = await shippingServices.calculateShippingCost(req.body);
      return res.status(200).json({
        status: "success",
        message: "Shipping cost calculated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
