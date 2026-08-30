import { AddressModel } from "../models/addressModel.js";
import { AppError } from "../utils/appError.js";

export class addressServices {
  static async createAddress(userId, payload) {
    const newAddress = await AddressModel.createAddress(userId, payload);
    return newAddress;
  }

  static async getUserAddresses(userId) {
    const addresses = await AddressModel.getAddressesByUserId(userId);
    return addresses;
  }

  static async updateAddress(addressId, userId, payload) {
    // Check if address exists and belongs to user
    const existingAddress = await AddressModel.getAddressByIdAndUserId(addressId, userId);
    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    const updatedAddress = await AddressModel.updateAddress(addressId, userId, payload);
    return updatedAddress;
  }

  static async deleteAddress(addressId, userId) {
    const existingAddress = await AddressModel.getAddressByIdAndUserId(addressId, userId);
    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    await AddressModel.deleteAddress(addressId, userId);
    return true;
  }
}
