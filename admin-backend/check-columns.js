#!/usr/bin/env node
/**
 * Check actual database column types
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkColumns() {
  console.log('🔍 Checking Database Column Types...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'translam',
    port: process.env.DB_PORT || 3306
  };
  
  try {
    const connection = await mysql.createConnection(config);
    
    // Check which tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
    `, [config.database]);
    
    console.log('📋 Available Tables:');
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    console.log('');
    
    // Check column types for image-related columns
    const tablesToCheck = [
      'AboutGroups',
      'DirectorDesks', 
      'Philosophies',
      'OutstandingPlacements',
      'WhyChooseUs',
      'OurRecruiters',
      'OurInstitutions',
      'OurSuccesses'
    ];
    
    for (const tableName of tablesToCheck) {
      console.log(`🔍 Checking ${tableName}:`);
      
      try {
        const [columns] = await connection.execute(`
          SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
          AND COLUMN_NAME LIKE '%Image%'
        `, [config.database, tableName]);
        
        if (columns.length === 0) {
          console.log(`   ⚠️  Table doesn't exist or has no image columns`);
        } else {
          columns.forEach(col => {
            console.log(`   📄 ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.DATA_TYPE})`);
            if (col.DATA_TYPE === 'varchar' && col.CHARACTER_MAXIMUM_LENGTH <= 255) {
              console.log(`   ❌ PROBLEM: Still VARCHAR(${col.CHARACTER_MAXIMUM_LENGTH}) - needs to be TEXT`);
            } else if (col.DATA_TYPE === 'text') {
              console.log(`   ✅ GOOD: Already TEXT type`);
            }
          });
        }
      } catch (error) {
        console.log(`   ❌ Error checking table: ${error.message}`);
      }
      console.log('');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Failed to check columns:', error.message);
    process.exit(1);
  }
}

checkColumns();