import { exec } from "child_process";
import path from "path";
import fs from "fs";
import env from "../src/config/env.js";

/**
 * Script Otomatis Database Backup & PITR preparation.
 * Menghasilkan snapshot SQL terkompresi dengan timestamp.
 */
const backupDir = path.join(process.cwd(), "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = path.join(backupDir, `db_backup_${env.DB_NAME}_${timestamp}.sql`);

console.log(`📦 Starting automated PostgreSQL backup to: ${backupFile}`);

const cmd = `PGPASSWORD="${env.DB_PASSWORD}" pg_dump -h ${env.DB_HOST} -p ${env.DB_PORT} -U ${env.DB_USER} -d ${env.DB_NAME} -F c -b -v -f "${backupFile}"`;

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Database backup failed:", error.message);
    process.exit(1);
  }
  console.log("✅ Database snapshot created successfully!");
  console.log(`📁 File size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
  process.exit(0);
});
