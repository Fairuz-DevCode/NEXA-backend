import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
} from "@jest/globals";

// Mock dependencies using unstable_mockModule
jest.unstable_mockModule(
  "../../../src/services/authService.js",
  () => ({
    AuthService: {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
      refreshTokenServices: jest.fn(),
      logoutUser: jest.fn(),
    },
  }),
);

jest.unstable_mockModule(
  "../../../src/validations/authValidation.js",
  () => ({
    validateRegisterInput: jest.fn(),
    validateLoginInput: jest.fn(),
  }),
);

// Dynamically import under test and mocked modules
const { AuthController } =
  await import("../../../src/controllers/authController.js");
const { AuthService } =
  await import("../../../src/services/authService.js");
const { validateRegisterInput, validateLoginInput } =
  await import("../../../src/validations/authValidation.js");

describe("AuthController Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
  });

  describe("register", () => {
    it("should register successfully and return 201", async () => {
      req.body = {
        name: "Alice",
        email: "alice@example.com",
        password: "Password1!",
      };
      validateRegisterInput.mockReturnValue(null);
      AuthService.registerUser.mockResolvedValue({
        user: {
          id: 1,
          name: "Alice",
          email: "alice@example.com",
          role: "user",
        },
        accessToken: "access123",
        refreshToken: "refresh123",
      });

      await AuthController.register(req, res);

      expect(validateRegisterInput).toHaveBeenCalledWith(
        req.body,
      );
      expect(AuthService.registerUser).toHaveBeenCalledWith(
        req.body,
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh123",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Registration Succes",
        data: {
          user: {
            id: 1,
            name: "Alice",
            email: "alice@example.com",
            role: "user",
          },
          accessToken: "access123",
        },
      });
    });

    it("should return 422 if validation fails", async () => {
      req.body = {
        name: "",
        email: "invalid",
        password: "123",
      };
      const validationError = {
        name: ["Nama tidak boleh kosong"],
      };
      validateRegisterInput.mockReturnValue(
        validationError,
      );

      await AuthController.register(req, res);

      expect(validateRegisterInput).toHaveBeenCalledWith(
        req.body,
      );
      expect(
        AuthService.registerUser,
      ).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "validation failed",
        errors: validationError,
      });
    });

    it("should return 409 if email is already registered", async () => {
      req.body = {
        name: "Alice",
        email: "duplicate@example.com",
        password: "Password1!",
      };
      validateRegisterInput.mockReturnValue(null);
      AuthService.registerUser.mockRejectedValue(
        new Error("Email already registered"),
      );

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Email already registered",
        errors: null,
      });
    });

    it("should return 500 on internal server error", async () => {
      req.body = {
        name: "Alice",
        email: "error@example.com",
        password: "Password1!",
      };
      validateRegisterInput.mockReturnValue(null);
      AuthService.registerUser.mockRejectedValue(
        new Error("Database failure"),
      );

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    });
  });

  describe("login", () => {
    it("should log in successfully and return 200", async () => {
      req.body = {
        email: "alice@example.com",
        password: "Password1!",
      };
      validateLoginInput.mockReturnValue(null);
      AuthService.loginUser.mockResolvedValue({
        user: {
          id: 1,
          name: "Alice",
          email: "alice@example.com",
        },
        accessToken: "access123",
        refreshToken: "refresh123",
      });

      await AuthController.login(req, res);

      expect(validateLoginInput).toHaveBeenCalledWith(
        req.body,
      );
      expect(AuthService.loginUser).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "Password1!",
      });
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh123",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Login successful",
        data: {
          user: {
            id: 1,
            name: "Alice",
            email: "alice@example.com",
          },
          accessToken: "access123",
        },
      });
    });

    it("should return 422 if validation fails", async () => {
      req.body = { email: "", password: "" };
      const validationError = {
        email: ["Email tidak boleh kosong"],
      };
      validateLoginInput.mockReturnValue(validationError);

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Validation failed",
        errors: validationError,
      });
    });

    it("should return 401 for invalid credentials", async () => {
      req.body = {
        email: "wrong@example.com",
        password: "WrongPassword!",
      };
      validateLoginInput.mockReturnValue(null);
      AuthService.loginUser.mockRejectedValue(
        new Error("Invalid credentials"),
      );

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Invalid email or password",
        errors: null,
      });
    });

    it("should return 500 on internal server error", async () => {
      req.body = {
        email: "error@example.com",
        password: "Password1!",
      };
      validateLoginInput.mockReturnValue(null);
      AuthService.loginUser.mockRejectedValue(
        new Error("Database crash"),
      );

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    });
  });

  describe("refresh", () => {
    it("should refresh access token and return 200", async () => {
      req.cookies = { refreshToken: "validRefreshToken" };
      AuthService.refreshTokenServices.mockResolvedValue({
        accessToken: "newAccess123",
      });

      await AuthController.refresh(req, res);

      expect(
        AuthService.refreshTokenServices,
      ).toHaveBeenCalledWith("validRefreshToken");
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Access token refreshed successfully",
        data: "newAccess123",
      });
    });

    it("should return 401 if refresh token cookie is missing", async () => {
      req.cookies = {};

      await AuthController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Refresh token missing or invalid",
        errors: "Invalid or expired refresh token",
      });
    });

    it("should return 401 if service rejects token as invalid or expired", async () => {
      req.cookies = { refreshToken: "invalidToken" };
      AuthService.refreshTokenServices.mockRejectedValue(
        new Error("Refresh token tidak valid atau expired"),
      );

      await AuthController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Refresh token missing or invalid",
        errors: "Invalid or expired refresh token",
      });
    });

    it("should return 500 on database error", async () => {
      req.cookies = { refreshToken: "validToken" };
      AuthService.refreshTokenServices.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await AuthController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    });
  });

  describe("logout", () => {
    it("should log out and clear cookie successfully returning 200", async () => {
      req.cookies = { refreshToken: "tokenToDelete" };
      AuthService.logoutUser.mockResolvedValue();

      await AuthController.logout(req, res);

      expect(AuthService.logoutUser).toHaveBeenCalledWith(
        "tokenToDelete",
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Logout successful",
      });
    });

    it("should return 401 if refresh token is missing", async () => {
      req.cookies = {};

      await AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Unauthorized access",
        errors:
          "User not authenticated or session already expired",
      });
    });

    it("should return 500 if logout services fails", async () => {
      req.cookies = { refreshToken: "tokenToDelete" };
      AuthService.logoutUser.mockRejectedValue(
        new Error("Database error"),
      );

      await AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        errors: null,
      });
    });
  });
});
