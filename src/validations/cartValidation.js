import { z } from "zod";

export const addCartItemSchema = z.object({
  product_id: z
    .number({
      required_error: "Product ID is required and must be an integer",
      invalid_type_error: "Product ID is required and must be an integer",
    })
    .int("Product ID is required and must be an integer"),
  product_variant_id: z
    .number({
      required_error: "Product variant ID is required and must be an integer",
      invalid_type_error: "Product variant ID is required and must be an integer",
    })
    .int("Product variant ID is required and must be an integer"),
  quantity: z
    .number({
      required_error: "Quantity must be a positive integer",
      invalid_type_error: "Quantity must be a positive integer",
    })
    .int("Quantity must be a positive integer")
    .positive("Quantity must be a positive integer"),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number({
      required_error: "Quantity must be a positive integer",
      invalid_type_error: "Quantity must be a positive integer",
    })
    .int("Quantity must be a positive integer")
    .positive("Quantity must be a positive integer"),
});
