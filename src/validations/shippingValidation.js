import { z } from "zod";

const validShippingStatuses = [
  "pending",
  "in_transit",
  "shipped",
  "out_for_delivery",
  "delivered",
  "failed",
];

export const updateShippingSchema = z.object({
  courier: z
    .string({
      required_error: "Courier is required",
      invalid_type_error: "Courier is required",
    })
    .min(1, "Courier is required"),
  tracking_number: z
    .string({
      required_error: "Tracking number is required",
      invalid_type_error: "Tracking number is required",
    })
    .min(1, "Tracking number is required"),
  shipping_status: z
    .string({
      required_error: "Invalid shipping status",
      invalid_type_error: "Invalid shipping status",
    })
    .refine((val) => validShippingStatuses.includes(val), {
      message: "Invalid shipping status",
    }),
});
