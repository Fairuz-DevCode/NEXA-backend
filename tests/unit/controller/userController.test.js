import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock dependencies using unstable_mockModule
jest.unstable_mockModule("../../../src/services/userService.js", () => ({
  UserService: {
    getUserById: jest.fn(),
    updateUserProfile: jest.fn(),
    changeUserPassword: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../src/validations/userValidation.js", () => ({
  validateUpdateUser: jest.fn(),
  validateChangePassword: jest.fn(),
}));

// Dynamically import under test and mocked modules
const { UserController } = await import("../../../src/controllers/userController.js");
const { UserService } = await import("../../../src/services/userService.js");
const { validateUpdateUser, validateChangePassword } = await import("../../../src/validations/userValidation.js");

describe("UserController Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1 },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getProfile", () => {
    it("should return profile details successfully with 200", async () => {
      const mockUser = { id: 1, name: "Alice", email: "alice@example.com" };
      UserService.getUserById.mockResolvedValue(mockUser);

      await UserController.getProfile(req, res);

      expect(UserService.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "succes get profile",
        data: mockUser,
      });
    });

    it("should return 404 if user is not found", async () => {
      UserService.getUserById.mockResolvedValue(null);

      await UserController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "user tidak ditemukan",
      });
    });

    it("should return 500 on unexpected errors", async () => {
      UserService.getUserById.mockRejectedValue(new Error("Database offline"));

      await UserController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Database offline",
      });
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully with 200", async () => {
      req.body = { name: "Alice Updated", phone: "+628123456789" };
      validateUpdateUser.mockReturnValue(null);
      UserService.updateUserProfile.mockResolvedValue({
        id: 1,
        name: "Alice Updated",
        phone: "+628123456789",
      });

      await UserController.updateProfile(req, res);

      expect(validateUpdateUser).toHaveBeenCalledWith(req.body);
      expect(UserService.updateUserProfile).toHaveBeenCalledWith(1, {
        name: "Alice Updated",
        phone: "+628123456789",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success update profile",
        data: { id: 1, name: "Alice Updated", phone: "+628123456789" },
      });
    });

    it("should return 400 if validateUpdateUser fails", async () => {
      req.body = { phone: "invalid" };
      const validationError = "Nomer telpon tidak valid";
      validateUpdateUser.mockReturnValue(validationError);

      await UserController.updateProfile(req, res);

      expect(validateUpdateUser).toHaveBeenCalledWith(req.body);
      expect(UserService.updateUserProfile).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: validationError,
      });
    });

    it("should return 400 if neither name nor phone is provided", async () => {
      req.body = {};
      validateUpdateUser.mockReturnValue(null);

      await UserController.updateProfile(req, res);

      expect(UserService.updateUserProfile).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "setidaknya 1 harus di rubah",
      });
    });

    it("should return 500 on unexpected errors during update", async () => {
      req.body = { name: "Alice" };
      validateUpdateUser.mockReturnValue(null);
      UserService.updateUserProfile.mockRejectedValue(new Error("Service error"));

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service error",
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully with 200", async () => {
      req.body = { currentPassword: "OldPassword1!", newPassword: "NewPassword1!" };
      validateChangePassword.mockReturnValue(null);
      UserService.changeUserPassword.mockResolvedValue(true);

      await UserController.changePassword(req, res);

      expect(validateChangePassword).toHaveBeenCalledWith(req.body);
      expect(UserService.changeUserPassword).toHaveBeenCalledWith(
        1,
        "OldPassword1!",
        "NewPassword1!"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "succes",
        message: "Password berhasil dirubah",
      });
    });

    it("should return 400 if validateChangePassword fails", async () => {
      req.body = { currentPassword: "", newPassword: "short" };
      const validationError = "Password lama wajib diisi";
      validateChangePassword.mockReturnValue(validationError);

      await UserController.changePassword(req, res);

      expect(validateChangePassword).toHaveBeenCalledWith(req.body);
      expect(UserService.changeUserPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: validationError,
      });
    });

    it("should return 400 if currentPassword or newPassword is missing in body", async () => {
      req.body = { currentPassword: "Old" }; // newPassword missing
      validateChangePassword.mockReturnValue(null);

      await UserController.changePassword(req, res);

      expect(UserService.changeUserPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "password lama dan password baru harus diisi",
      });
    });

    it("should return 400 fail status on password service errors", async () => {
      req.body = { currentPassword: "OldPassword1!", newPassword: "NewPassword1!" };
      validateChangePassword.mockReturnValue(null);
      UserService.changeUserPassword.mockRejectedValue(new Error("password lama salah"));

      await UserController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "password lama salah",
      });
    });
  });
});
