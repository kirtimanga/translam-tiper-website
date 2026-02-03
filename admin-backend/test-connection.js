#!/usr/bin/env node
/**
 * Simple database connection test
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔌 Testing Database Connection...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'translam',
    port: process.env.DB_PORT || 3306
  };
  
  console.log('📋 Connection Config:');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Password: ${config.password ? '[SET]' : '[NOT SET]'}\n`);
  
  try {
    console.log('🔄 Connecting to MySQL...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed:', rows[0]);
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(row => row.Database === config.database);
    console.log(`✅ Database '${config.database}' exists:`, dbExists);
    
    if (!dbExists) {
      console.log(`🔧 Creating database '${config.database}'...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
      console.log('✅ Database created successfully');
    }
    
    await connection.end();
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Make sure MySQL server is running');
    console.error('   2. Verify username and password in .env file');
    console.error('   3. Check if user has proper permissions');
    console.error('   4. Ensure database exists or user can create it');
    process.exit(1);
  }
}

testConnection();