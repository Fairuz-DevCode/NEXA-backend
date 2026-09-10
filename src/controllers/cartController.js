import { cartServices } from "../services/cartServices.js";

export default class cartController {
  static async addItem(req, res, next) {
    try {
      const userId = req.user.id;
      const newItem = await cartServices.addItem(userId, req.body);
      return res.status(201).json({
        status: "success",
        message: "Item added to cart successfully",
        data: newItem,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cartData = await cartServices.getUserCart(userId);
      return res.status(200).json({
        status: "success",
        message: "User cart fetched successfully",
        data: cartData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItemQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const itemId = parseInt(req.params.id, 10);
      const updatedItem = await cartServices.updateItemQuantity(userId, itemId, req.body.quantity);
      return res.status(200).json({
        status: "success",
        message: "Cart item quantity updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const userId = req.user.id;
      const itemId = parseInt(req.params.id, 10);
      await cartServices.removeItem(userId, itemId);
      return res.status(200).json({
        status: "success",
        message: "Item removed from cart successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
