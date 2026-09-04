import pool from "../config/db.js";

export default class productModel {
  static async createProduct(
    client,
    {
      category_id,
      sku,
      name,
      slug,
      description,
      price,
      img_url,
    },
  ) {
    const dbClient = client || pool;
    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const result = await dbClient.query(
      `INSERT INTO products (category_id, sku, name, slug, description, price, img_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, category_id, sku, name, slug, description, price, img_url, created_at ;`,
      [
        category_id,
        sku,
        name,
        generatedSlug,
        description,
        price,
        img_url,
      ],
    );
    return result.rows[0] || null;
  }

  static async createVariant(
    client,
    productId,
    { size, stock },
  ) {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `INSERT INTO product_variants (product_id, size, stock) VALUES ($1, $2, $3) RETURNING id, product_id, size, stock;`,
      [productId, size, stock],
    );
    return result.rows[0] || null;
  }

  static async getAllProducts(limit = 10, offset = 0) {
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

  static async getProductById(id) {
    const result = await pool.query(
      `SELECT p.id, p.category_id, p.sku, p.name, p.slug, p.description, p.price, p.img_url, 
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
      [id],
    );
    return result.rows[0] || null;
  }

  static async updateProduct(
    client,
    id,
    {
      category_id,
      sku,
      img_url,
      name,
      slug,
      description,
      price,
    },
  ) {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE products SET category_id = COALESCE($1, category_id), sku = COALESCE($2, sku), img_url = COALESCE($3, img_url), name = COALESCE($4, name), slug = COALESCE($5, slug), description = COALESCE($6, description), price = COALESCE($7, price) WHERE id = $8 RETURNING id, category_id, sku, img_url, name, slug, description, price;`,
      [
        category_id,
        sku,
        img_url,
        name,
        slug,
        description,
        price,
        id,
      ],
    );
    return result.rows[0] || null;
  }

  static async updateProductVariant(
    client,
    id,
    { size, stock },
  ) {
    const dbClient = client || pool;
    const result = await dbClient.query(
      `UPDATE product_variants SET size = $1, stock = $2 WHERE id = $3 RETURNING id, product_id, size, stock;`,
      [size, stock, id],
    );
    return result.rows[0] || null;
  }

  static async deleteProduct(client, productId) {
    const dbClient = client || pool;
    const query = `DELETE FROM products WHERE id = $1 RETURNING id;`;
    const result = await dbClient.query(query, [productId]);
    return result.rows[0] || null;
  }

  static async deleteVariants(client, productId) {
    const dbClient = client || pool;
    const query = `DELETE FROM product_variants WHERE product_id = $1;`;
    await dbClient.query(query, [productId]);
  }

  static async findCategories(slug, parentId = null) {
    let query;
    let values;
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

  static async getSubcategories(parentId) {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE parent_id = $1 ORDER BY id ASC;`,
      [parentId],
    );
    return result.rows;
  }

  static async getProductsByCategoryId(categoryId) {
    const result = await pool.query(
      `SELECT id, category_id, sku, name, slug, description, price, img_url FROM products WHERE category_id = $1 ORDER BY id ASC;`,
      [categoryId],
    );
    return result.rows;
  }

  static async getProductBySlug(slug) {
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
      [slug],
    );
    return result.rows[0] || null;
  }

  static async getCategoriesById(id) {
    const result = await pool.query(
      `SELECT id, name, slug, parent_id FROM categories WHERE id = $1;`,
      [id],
    );
    return result.rows[0] || null;
  }
}
