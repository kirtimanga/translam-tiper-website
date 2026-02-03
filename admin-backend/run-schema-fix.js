#!/usr/bin/env node
/**
 * Direct command-line schema fix script
 * Run this instead of using the API endpoint
 */

// Load environment variables first
require('dotenv').config();

console.log('🔧 Starting Direct Schema Fix...');
console.log('This will update your database columns to handle large image data.\n');

// Show database connection info (without password)
console.log(`📋 Database Info:`);
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   User: ${process.env.DB_USER || 'root'}`);
console.log(`   Database: ${process.env.DB_NAME || 'translam'}`);
console.log(`   Port: ${process.env.DB_PORT || 3306}`);
console.log('');

const { updateImageColumns } = require('./update-image-columns');

async function runSchemaFix() {
  try {
    await updateImageColumns(true); // Close connection when done
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    process.exit(1);
  }
}

runSchemaFix();