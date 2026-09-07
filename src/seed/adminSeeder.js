import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    const name = "admin1";
    const email = "admin@streetwear.com";
    const password = "admin123";

    const existingAdmin = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Akun admin sudah ada di database.");
      process.exit(0);
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(
      password,
      saltRound,
    );

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, "admin"],
    );

    console.log("Berhasil membuat akun admin baru!");
    process.exit(0);
  } catch (error) {
    console.error("Gagal seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
