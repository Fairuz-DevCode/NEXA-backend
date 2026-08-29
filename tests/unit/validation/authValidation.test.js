import { describe, it, expect } from "@jest/globals";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../../../src/validations/authValidation.js";

describe("Auth Validation Unit Tests", () => {
  describe("validateRegisterInput", () => {
    it("should return null for valid registration input", () => {
      const input = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "Password1!",
      };
      const result = validateRegisterInput(input);
      expect(result).toBeNull();
    });

    it("should fail when name is empty", () => {
      const input = {
        name: "",
        email: "john.doe@example.com",
        password: "Password1!",
      };
      const result = validateRegisterInput(input);
      expect(result).not.toBeNull();
      expect(result.name).toContain("Nama tidak boleh kosong");
    });

    it("should fail when name contains forbidden words", () => {
      const input = {
        name: "Administrator User",
        email: "john.doe@example.com",
        password: "Password1!",
      };
      const result = validateRegisterInput(input);
      expect(result).not.toBeNull();
      expect(result.name[0]).toContain("Nama tidak boleh mengandung kata admin");
    });

    it("should fail when email is invalid", () => {
      const input = {
        name: "John Doe",
        email: "invalid-email",
        password: "Password1!",
      };
      const result = validateRegisterInput(input);
      expect(result).not.toBeNull();
      expect(result.email).toContain("Format email tidak valid");
    });

    it("should fail when email contains forbidden word in local part", () => {
      const input = {
        name: "John Doe",
        email: "root_user@example.com",
        password: "Password1!",
      };
      const result = validateRegisterInput(input);
      expect(result).not.toBeNull();
      expect(result.email[0]).toContain("Email tidak boleh mengandung kata root");
    });

    it("should fail when password does not meet complexity requirements", () => {
      const input = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "123", // too short, no uppercase, no lowercase, no special char
      };
      const result = validateRegisterInput(input);
      expect(result).not.toBeNull();
      expect(result.password[0]).toContain("Password harus :");
    });
  });

  describe("validateLoginInput", () => {
    it("should return null for valid login input", () => {
      const input = {
        email: "john.doe@example.com",
        password: "Password1!",
      };
      const result = validateLoginInput(input);
      expect(result).toBeNull();
    });

    it("should fail when email is empty", () => {
      const input = {
        email: "",
        password: "Password1!",
      };
      const result = validateLoginInput(input);
      expect(result).not.toBeNull();
      expect(result.email).toContain("Email tidak boleh kosong");
    });

    it("should fail when password is empty", () => {
      const input = {
        email: "john.doe@example.com",
        password: "",
      };
      const result = validateLoginInput(input);
      expect(result).not.toBeNull();
      expect(result.password).toContain("Password tidak boleh kosong");
    });
  });
});
