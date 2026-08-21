import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  nameSchema,
  passwordSchema,
} from "./authValidation.js";

const phoneSchema = z.string().refine(
  (val) => {
    const phoneNumber = parsePhoneNumberFromString(
      val,
      "ID",
    );
    return phoneNumber ? phoneNumber.isValid() : false;
  },
  {
    message:
      "Nomer telpon tidak valid untuk wilayah indonesia",
  },
);

export const updateUserPofile = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
});

export const changePassword = z.object({
  currentPassword: z
    .string()
    .min(1, "Password lama wajib diisi "),
  newPassword: passwordSchema.optional(),
});

export const validateUpdateUser = (data) => {
  const result = updateUserPofile.safeParse(data);
  if (!result.success) {
    return result.error.flatten().fieldErrors;
  }
  return null;
};

export const validateChangePassword = (data) => {
  const result = changePassword.safeParse(data);
  if (!result.success) {
    return result.error.flatten().fieldErrors;
  }
  return null;
};
