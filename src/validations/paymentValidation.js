import { z } from "zod";

export const createPaymentSchema = z.object({
  order_id: z
    .number({
      required_error: "Order ID is required and must be an integer",
      invalid_type_error: "Order ID is required and must be an integer",
    })
    .int("Order ID is required and must be an integer"),
  payment_type: z
    .string({
      required_error: "Payment type is required",
      invalid_type_error: "Payment type is required",
    })
    .min(1, "Payment type is required"),
});
