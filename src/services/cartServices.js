import cartModel from "../models/cartModel.js";

const createError = (statusCode, message, errors = null, status = "fail") => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = status;
  err.errors = errors;
  return err;
};

export class cartServices {
  static async addItem(userId, { product_id, product_variant_id, quantity }) {
    const variant = await cartModel.checkVariantStock(null, product_variant_id);
    if (!variant || variant.product_id !== product_id) {
      throw createError(404, "Product or variant not found");
    }

    if (quantity > variant.stock) {
      throw createError(400, "Requested quantity exceeds available stock");
    }

    const cart = await cartModel.findOrCreateCart(null, userId);
    const existingItem = await cartModel.findCartItem(null, cart.id, product_variant_id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > variant.stock) {
        throw createError(400, "Requested quantity exceeds available stock");
      }
      const updated = await cartModel.updateCartItemQuantity(null, existingItem.id, newQuantity);
      return updated;
    }

    const newItem = await cartModel.addCartItem(null, cart.id, product_id, product_variant_id, quantity);
    return newItem;
  }

  static async getUserCart(userId) {
    const cart = await cartModel.findOrCreateCart(null, userId);
    const items = await cartModel.getCartDetails(null, cart.id);

    const formattedItems = items.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_variant_id: item.product_variant_id,
      size: item.size,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    }));

    const totalPrice = formattedItems.reduce((acc, item) => acc + item.subtotal, 0);

    return {
      id: cart.id,
      user_id: userId,
      items: formattedItems,
      total_price: totalPrice,
    };
  }

  static async updateItemQuantity(userId, itemId, quantity) {
    const item = await cartModel.findCartItemById(null, itemId);
    if (!item || item.user_id !== userId) {
      throw createError(404, "Cart item not found");
    }

    const variant = await cartModel.checkVariantStock(null, item.product_variant_id);
    if (!variant || quantity > variant.stock) {
      throw createError(400, "Quantity must be greater than 0 and not exceed stock");
    }

    const updated = await cartModel.updateCartItemQuantity(null, itemId, quantity);
    return updated;
  }

  static async removeItem(userId, itemId) {
    const item = await cartModel.findCartItemById(null, itemId);
    if (!item || item.user_id !== userId) {
      throw createError(404, "Cart item not found");
    }

    await cartModel.removeCartItem(null, itemId);
  }
}
