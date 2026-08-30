import { addressServices } from "../services/addressServices.js";

export default class addressController {
  static async createAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const newAddress = await addressServices.createAddress(userId, req.body);
      
      return res.status(200).json({
        status: "success",
        message: "Address added successfully",
        data: newAddress
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      const addresses = await addressServices.getUserAddresses(userId);
      
      return res.status(200).json({
        status: "success",
        message: "User addresses fetch successfully",
        data: addresses
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      
      const updatedAddress = await addressServices.updateAddress(addressId, userId, req.body);
      
      return res.status(200).json({
        status: "success",
        message: "User address update successfully",
        data: updatedAddress
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      
      await addressServices.deleteAddress(addressId, userId);
      
      return res.status(200).json({
        status: "success",
        message: "Address deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}
