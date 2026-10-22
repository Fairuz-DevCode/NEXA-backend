import pool from "../config/db.js";
import { hashPassword } from "../utils/password.js";

async function seed() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Seed Categories
  console.log("--> Seeding Categories...");
  const categories = [
    { name: "Sneakers", slug: "sneakers" },
    { name: "Boots", slug: "boots" },
    { name: "Athletic", slug: "athletic" },
    { name: "Formal", slug: "formal" },
    { name: "High Heels", slug: "high-heels" },
  ];

  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug) 
       VALUES ($1, $2) 
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
      [cat.name, cat.slug]
    );
  }

  // Ambil category IDs
  const catRes = await pool.query("SELECT id, slug FROM categories");
  const catMap = new Map<string, number>();
  catRes.rows.forEach((r) => catMap.set(r.slug, r.id));

  // 2. Seed Users
  console.log("--> Seeding Users...");
  const adminPass = await hashPassword("Admin123!");
  const userPass = await hashPassword("User123!");

  await pool.query(
    `INSERT INTO users (name, email, password, role, phone, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (email) DO NOTHING`,
    ["Nexa Admin", "admin@nexa.com", adminPass, "admin", "08123456789"]
  );

  await pool.query(
    `INSERT INTO users (name, email, password, role, phone, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (email) DO NOTHING`,
    ["Customer Demo", "customer@nexa.com", userPass, "user", "08987654321"]
  );

  // 3. Seed Products & Variants
  console.log("--> Seeding Products & Variants...");
  const products = [
    {
      category_id: catMap.get("sneakers") || 1,
      sku: "SNK-LOW-01",
      name: "Classic Street Low Top",
      slug: "classic-street-low-top",
      description: "Low top streetwear sneaker with vulcanized rubber sole and breathable canvas.",
      price: 650000,
      img_url: "/img/sneakers-low-top.jpg",
      variants: [
        { size: "40", stock: 15 },
        { size: "41", stock: 20 },
        { size: "42", stock: 25 },
        { size: "43", stock: 10 },
      ],
    },
    {
      category_id: catMap.get("sneakers") || 1,
      sku: "SNK-HIGH-02",
      name: "Retro High Top Runner",
      slug: "retro-high-top-runner",
      description: "Vintage inspired silhouette high top with premium leather upper.",
      price: 890000,
      img_url: "/img/sneakers-high-top.jpg",
      variants: [
        { size: "41", stock: 12 },
        { size: "42", stock: 18 },
        { size: "43", stock: 14 },
      ],
    },
    {
      category_id: catMap.get("boots") || 2,
      sku: "BOT-CHEL-03",
      name: "Urban Chelsea Boots",
      slug: "urban-chelsea-boots",
      description: "Sleek matte finish leather chelsea boots with elastic side panels.",
      price: 1150000,
      img_url: "/img/boots-chelsea-men.jpg",
      variants: [
        { size: "40", stock: 8 },
        { size: "41", stock: 15 },
        { size: "42", stock: 12 },
      ],
    },
    {
      category_id: catMap.get("athletic") || 3,
      sku: "ATH-RUN-04",
      name: "Velocity Aero Sport",
      slug: "velocity-aero-sport",
      description: "Ultra lightweight athletic shoe designed for responsive energy return.",
      price: 780000,
      img_url: "/img/category-sport.png",
      variants: [
        { size: "39", stock: 10 },
        { size: "40", stock: 16 },
        { size: "41", stock: 20 },
        { size: "42", stock: 15 },
      ],
    },
  ];

  for (const p of products) {
    const prodRes = await pool.query(
      `INSERT INTO products (category_id, sku, name, slug, description, price, img_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (sku) DO UPDATE 
       SET name = EXCLUDED.name, price = EXCLUDED.price, img_url = EXCLUDED.img_url
       RETURNING id`,
      [p.category_id, p.sku, p.name, p.slug, p.description, p.price, p.img_url]
    );

    const productId = prodRes.rows[0].id;
    for (const v of p.variants) {
      await pool.query(
        `INSERT INTO product_variants (product_id, size, stock)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [productId, v.size, v.stock]
      );
    }
  }

  console.log("✅ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
