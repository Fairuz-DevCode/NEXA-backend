import { z } from "zod";

export const createOrderSchema = z.object({
  address_id: z
    .number({
      required_error: "Address ID is required and must be an integer",
      invalid_type_error: "Address ID is required and must be an integer",
    })
    .int("Address ID is required and must be an integer"),
  shipping_cost: z
    .number({
      required_error: "Shipping cost is required and must be a non-negative integer",
      invalid_type_error: "Shipping cost is required and must be a non-negative integer",
    })
    .int("Shipping cost is required and must be a non-negative integer")
    .nonnegative("Shipping cost is required and must be a non-negative integer"),
});
