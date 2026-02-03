const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

async function createAdminTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM("admin", "super_admin") DEFAULT "admin",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `;
    
    await pool.execute(createTableQuery);
    console.log("✅ Admin users table created/verified");
    
    // Check if default admin exists
    const [rows] = await pool.execute("SELECT id FROM admin_users WHERE email = ?", ["admin@translam.com"]);
    
    if (rows.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin", 12);
      await pool.execute(
        "INSERT INTO admin_users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ["admin", "admin@translam.com", hashedPassword, "super_admin"]
      );
      console.log("✅ Default admin user created");
      console.log("📧 Email: admin@translam.com");
      console.log("🔑 Password: admin");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
    
  } catch (error) {
    console.error("❌ Error creating admin table:", error.message);
  }
}

module.exports = { createAdminTable };
