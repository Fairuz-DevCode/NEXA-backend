import { execSync } from "child_process";

async function runMigration() {
  console.log("🚀 Running Database Migration via Prisma...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("✅ Database schema migrated successfully via Prisma!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

runMigration();
