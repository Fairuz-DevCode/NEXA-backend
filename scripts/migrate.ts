import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

async function runMigration() {
  console.log("🚀 Running Database Migration...");
  const sqlPath = path.join(process.cwd(), "schema/db/init.sql");
  
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ init.sql file not found at:", sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf-8");
  try {
    await pool.query(sql);
    console.log("✅ Database schema migrated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

runMigration();
