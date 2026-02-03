const { pool } = require('./src/config/database');

async function checkAndCreateShortNewsTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔍 Checking ShortNews table...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'ShortNews'"
    );
    
    if (tables.length === 0) {
      console.log('📦 ShortNews table does not exist. Creating it now...');
      
      // Create the ShortNews table
      await connection.query(`
        CREATE TABLE ShortNews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ ShortNews table created successfully!');
      
      // Add some sample data
      await connection.query(`
        INSERT INTO ShortNews (title, is_active) VALUES 
        ('Welcome to our new website!', true),
        ('Admissions are now open for 2024-25', true),
        ('Check out our latest achievements', false)
      `);
      
      console.log('📝 Sample data added to ShortNews table');
    } else {
      console.log('✅ ShortNews table already exists');
      
      // Show table structure
      const [columns] = await connection.query(
        "DESCRIBE ShortNews"
      );
      
      console.log('📋 Table structure:');
      console.table(columns.map(col => ({
        Field: col.Field,
        Type: col.Type,
        Null: col.Null,
        Key: col.Key,
        Default: col.Default
      })));
      
      // Show sample data
      const [rows] = await connection.query(
        "SELECT * FROM ShortNews LIMIT 5"
      );
      
      console.log(`\n📊 Found ${rows.length} records in ShortNews table`);
      if (rows.length > 0) {
        console.table(rows);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

checkAndCreateShortNewsTable();