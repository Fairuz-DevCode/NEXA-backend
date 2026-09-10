import { paymentServices } from "../services/paymentServices.js";

export default class paymentController {
  static async createPayment(req, res, next) {
    try {
      const userId = req.user.id;
      const paymentData = await paymentServices.createPayment(userId, req.body);
      return res.status(201).json({
        status: "success",
        message: "Payment transaction created successfully",
        data: paymentData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleNotification(req, res, next) {
    try {
      await paymentServices.processNotification(req.body);
      return res.status(200).json({
        status: "success",
        message: "Payment notification processed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentByOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.orderId, 10);
      const userRole = req.user.role || "customer";
      const paymentDetail = await paymentServices.getPaymentDetail(userId, orderId, userRole);
      return res.status(200).json({
        status: "success",
        message: "Payment details fetched successfully",
        data: paymentDetail,
      });
    } catch (error) {
      next(error);
    }
  }
}
