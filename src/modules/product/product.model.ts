import pool from "../../config/db.js";
import { CreateProductDTO, ProductResponse, ProductVariantDTO, UpdateProductDTO } from "./product.types.js";

export class ProductModel {
  static async createProduct(
    client: any,
    { category_id, sku, name, slug, description, price, img_url }: CreateProductDTO
  ): Promise<ProductResponse> {
    const dbClient = client || pool;
    const generatedSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : null);

    const result = await dbClient.query(
      `INSERT INTO products (category_id, sku, name, slug, description, price, img_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, category_id, sku, name, slug, description, price, img_url, created_at;`,
      [category_id, sku, name, generatedSlug, description, price, img_url]
    );
    return result.rows[0];
  }

  static async createVariant(
    client: any,
    productId: number,
    { size, stock }: ProductVariantDTO
  ): Promise<ProductVariantDTO> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO product_variants (product_id, size, stock) VALUES ($1, $2, $3) RETURNING id, product_id, size, stock;`,
      [productId, size, stock]
    );
    return result.rows[0];
  }

  static async getAllProducts(limit = 10, offset = 0): Promise<{ products: ProductResponse[]; totalItems: number }> {
    const productQuery = `
      SELECT id, category_id, name, slug, price, img_url
      FROM products 
      ORDER BY id ASC 
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) FROM products;`;

    const [productResult, countResult] = await Promise.all([
      pool.query(productQuery, [limit, offset]),
      pool.query(countQuery),
    ]);

    return {
      products: productResult.rows,
      totalItems: parseInt(countResult.rows[0].count, 10),
    };
  }

  static async getProductById(id: number | string): Promise<ProductResponse | null> {
    const result = await pool.query(
      `SELECT p.id, p.category_id, p.sku, p.name, p.slug, p.description, p.price, p.gender, p.img_url, 
        COALESCE(
          json_agg(
            json_build_object('id', pv.id, 'size', pv.size, 'stock', pv.stock)
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products AS p 
      LEFT JOIN product_variants AS pv ON p.id = pv.product_id
      WHERE p.id = $1
      GROUP BY p.id;
      `,
      [id]
    );
    return result.rows[0] || null;
  }

  static async updateProduct(
    client: any,
    id: number | string,
    { category_id, sku, img_url, name, slug, description, price }: UpdateProductDTO
  ): Promise<ProductResponse | null> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE products SET category_id = COALESCE($1, category_id), sku = COALESCE($2, sku), img_url = COALESCE($3, img_url), name = COALESCE($4, name), slug = COALESCE($5, slug), description = COALESCE($6, description), price = COALESCE($7, price) WHERE id = $8 RETURNING id, category_id, sku, img_url, name, slug, description, price;`,
      [category_id, sku, img_url, name, slug, description, price, id]
    );
    return result.rows[0] || null;
  }

  static async updateProductVariant(
    client: any,
    id: number | string,
    { size, stock }: ProductVariantDTO
  ): Promise<ProductVariantDTO | null> {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE product_variants SET size = $1, stock = $2 WHERE id = $3 RETURNING id, product_id, size, stock;`,
      [size, stock, id]
    );
    return result.rows[0] || null;
  }

  static async deleteProduct(client: any, productId: number | string): Promise<any> {
    const dbClient = client || pool;
    const result = await dbClient.query(`DELETE FROM products WHERE id = $1 RETURNING id;`, [productId]);
    return result.rows[0] || null;
  }

  static async deleteVariants(client: any, productId: number | string): Promise<void> {
    const dbClient = client || pool;
    await dbClient.query(`DELETE FROM product_variants WHERE product_id = $1;`, [productId]);
  }

  static async findCategories(slug: string, parentId: number | null = null): Promise<any> {
    let query: string;
    let values: any[];
    if (parentId === null) {
      query = `SELECT id, name, slug, parent_id FROM categories WHERE slug = $1 AND parent_id IS NULL;`;
      values = [slug];
    } else {
      query = `SELECT id, name, slug, parent_id FROM categories WHERE slug = $1 AND parent_id = $2;`;
      values = [slug, parentId];
    }
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async getSubcategories(parentId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE parent_id = $1 ORDER BY id ASC;`,
      [parentId]
    );
    return result.rows;
  }

  static async getProductsByCategoryId(categoryId: number): Promise<ProductResponse[]> {
    const result = await pool.query(
      `SELECT id, category_id, sku, name, slug, description, price, img_url FROM products WHERE category_id = $1 ORDER BY id ASC;`,
      [categoryId]
    );
    return result.rows;
  }

  static async getProductBySlug(slug: string): Promise<ProductResponse | null> {
    const result = await pool.query(
      `SELECT p.id, p.category_id, p.sku, p.name, p.slug, p.description, p.price, p.img_url, 
        COALESCE(
          json_agg(
            json_build_object('id', pv.id, 'size', pv.size, 'stock', pv.stock)
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants
      FROM products AS p 
      LEFT JOIN product_variants AS pv ON p.id = pv.product_id
      WHERE p.slug = $1
      GROUP BY p.id;
      `,
      [slug]
    );
    return result.rows[0] || null;
  }

  static async getCategoriesById(id: number): Promise<any> {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE id = $1;`,
      [id]
    );
    return result.rows[0] || null;
  }
}
