import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import pool from "../../src/config/db.js";

describe("CATEGORY & PRODUCT INTEGRATION TESTS", () => {
  let adminToken;
  let parentCategory;
  let subCategory;
  let createdProduct;

  beforeAll(async () => {
    // Generate valid admin mock JWT token
    adminToken = jwt.sign(
      { id: 1, email: "admin@example.com", role: "admin" },
      process.env.JWT_ACCESS_SECRET || "Acces89",
      { expiresIn: "1h" }
    );

    // Clean up test data if left over
    await pool.query(`DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'TEST-%')`);
    await pool.query(`DELETE FROM products WHERE sku LIKE 'TEST-%'`);
    await pool.query(`DELETE FROM categories WHERE slug IN ('test-elektronik', 'test-handphone')`);
  });

  afterAll(async () => {
    // Clean up test data after execution
    if (createdProduct && createdProduct.id) {
      await pool.query(`DELETE FROM product_variants WHERE product_id = $1`, [createdProduct.id]);
      await pool.query(`DELETE FROM products WHERE id = $1`, [createdProduct.id]);
    }
    if (subCategory && subCategory.id) {
      await pool.query(`DELETE FROM categories WHERE id = $1`, [subCategory.id]);
    }
    if (parentCategory && parentCategory.id) {
      await pool.query(`DELETE FROM categories WHERE id = $1`, [parentCategory.id]);
    }
  });

  describe("POST /api/categories (Create Categories)", () => {
    it("should return 401 if access token is missing", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "Test Elektronik", slug: "test-elektronik" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Not authorized");
    });

    it("should create parent category successfully when authenticated", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Elektronik",
          slug: "test-elektronik",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload.slug).toBe("test-elektronik");

      parentCategory = res.body.payload;
    });

    it("should create subcategory referencing parent category", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Handphone",
          slug: "test-handphone",
          parent_id: parentCategory.id,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.payload.parent_id).toBe(parentCategory.id);

      subCategory = res.body.payload;
    });
  });

  describe("GET /api/categories (List Categories)", () => {
    it("should list all categories without authentication", async () => {
      const res = await request(app).get("/api/categories");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.payload)).toBe(true);
    });
  });

  describe("POST /api/categories/product (Create Product)", () => {
    it("should create a product under subcategory", async () => {
      const res = await request(app)
        .post("/api/categories/product")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          category_id: subCategory.id,
          sku: `TEST-IP15P-${Date.now()}`,
          name: "iPhone 15 Pro",
          slug: "test-iphone-15-pro",
          description: "Flagship Apple Smartphone",
          price: 15000000,
          img_url: "/uploads/products/iphone15pro.jpg",
          variants: [
            { size: "128GB", stock: 15 },
            { size: "256GB", stock: 10 },
          ],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload.slug).toBe("test-iphone-15-pro");
      expect(res.body.payload.variants.length).toBe(2);

      createdProduct = res.body.payload;
    });
  });

  describe("DYNAMIC ROUTE: /categories/[category-slug]", () => {
    it("should fetch root category detail via /categories/test-elektronik", async () => {
      const res = await request(app).get("/api/categories/test-elektronik");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.payload.type).toBe("category");
      expect(res.body.payload.category.slug).toBe("test-elektronik");
      expect(res.body.payload.subcategories.some(sc => sc.slug === "test-handphone")).toBe(true);
    });

    it("should fetch subcategory detail via /categories/test-elektronik/test-handphone", async () => {
      const res = await request(app).get("/api/categories/test-elektronik/test-handphone");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.payload.type).toBe("category");
      expect(res.body.payload.category.slug).toBe("test-handphone");
      expect(res.body.payload.products.some(p => p.slug === "test-iphone-15-pro")).toBe(true);
    });
  });

  describe("DYNAMIC ROUTE: /categories/[category-slug]/[product-slug]", () => {
    it("should fetch product detail via /categories/test-elektronik/test-handphone/test-iphone-15-pro", async () => {
      const res = await request(app).get("/api/categories/test-elektronik/test-handphone/test-iphone-15-pro");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.payload.type).toBe("product");
      expect(res.body.payload.product.slug).toBe("test-iphone-15-pro");
      expect(res.body.payload.product.name).toBe("iPhone 15 Pro");
      expect(res.body.payload.product.variants.length).toBe(2);
    });
  });

  describe("404 Error handling for invalid slug paths", () => {
    it("should return 404 for non-existent category path", async () => {
      const res = await request(app).get("/api/categories/invalid-category-path-xyz");

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toBe("Category or product not found");
    });

    it("should return 404 for non-existent product under valid category", async () => {
      const res = await request(app).get("/api/categories/test-elektronik/test-handphone/non-existent-product-abc");

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toBe("Category or product not found");
    });
  });
});
