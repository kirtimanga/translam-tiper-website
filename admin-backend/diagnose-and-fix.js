#!/usr/bin/env node
/**
 * Comprehensive diagnosis and fix script for all database and API issues
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { sequelize } = require('./models');

async function diagnoseAndFix() {
  console.log('🔍 Comprehensive Diagnosis and Fix\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'translam',
    port: process.env.DB_PORT || 3306
  };
  
  try {
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Database connection successful\n');
    
    // Use the database
    await connection.execute(`USE \`${config.database}\``);
    
    // Step 1: Check existing tables
    console.log('📋 Step 1: Checking existing tables...');
    const [tables] = await connection.execute(`SHOW TABLES`);
    
    if (tables.length === 0) {
      console.log('⚠️  No tables exist. Creating all tables...\n');
    } else {
      console.log('Existing tables:');
      tables.forEach(table => {
        const tableName = table[`Tables_in_${config.database}`];
        console.log(`   - ${tableName}`);
      });
      console.log('');
    }
    
    // Step 2: Create/Fix DirectorDesks table specifically
    console.log('🔨 Step 2: Creating/Fixing DirectorDesks table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS DirectorDesks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        heroTitle VARCHAR(255) DEFAULT 'DIRECTOR DESK',
        heroBannerImage LONGTEXT DEFAULT '',
        mainHeading TEXT DEFAULT 'Translam Group: Empowering Futures for 37 Glorious Years',
        content LONGTEXT DEFAULT '',
        staffMembers LONGTEXT DEFAULT '[]',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Force update the heroBannerImage column to LONGTEXT (can handle very large data)
    try {
      await connection.execute(`ALTER TABLE DirectorDesks MODIFY COLUMN heroBannerImage LONGTEXT DEFAULT ''`);
      console.log('   ✅ heroBannerImage column updated to LONGTEXT');
    } catch (error) {
      console.log(`   ⚠️  Could not modify column: ${error.message}`);
    }
    
    console.log('   ✅ DirectorDesks table ready');
    
    // Step 3: Fix other tables too
    console.log('\n🔨 Step 3: Fixing other tables...');
    
    const tableUpdates = [
      {
        name: 'AboutGroups',
        sql: `CREATE TABLE IF NOT EXISTS AboutGroups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          heroTitle VARCHAR(255) DEFAULT 'ABOUT US',
          heroBannerImage LONGTEXT DEFAULT '',
          buildingImage LONGTEXT DEFAULT '',
          aboutUsTitle VARCHAR(255) DEFAULT 'About US',
          aboutUsContent LONGTEXT DEFAULT '',
          visionImage LONGTEXT DEFAULT '',
          visionTitle VARCHAR(255) DEFAULT 'Vision & Mission',
          visionContent LONGTEXT DEFAULT '',
          missionContent LONGTEXT DEFAULT '',
          aimsImage LONGTEXT DEFAULT '',
          aimsTitle VARCHAR(255) DEFAULT 'Aims & Objectives',
          aimsObjectives LONGTEXT DEFAULT '[]',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        imageColumns: ['heroBannerImage', 'buildingImage', 'visionImage', 'aimsImage']
      },
      {
        name: 'Philosophies',
        sql: `CREATE TABLE IF NOT EXISTS Philosophies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          heroTitle VARCHAR(255) DEFAULT 'PHILOSOPHY',
          heroBannerImage LONGTEXT DEFAULT '',
          mainQuote LONGTEXT DEFAULT '',
          content LONGTEXT DEFAULT '',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        imageColumns: ['heroBannerImage']
      },
      {
        name: 'OutstandingPlacements',
        sql: `CREATE TABLE IF NOT EXISTS OutstandingPlacements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          heroTitle VARCHAR(255) DEFAULT 'OUTSTANDING PLACEMENTS',
          heroBannerImage LONGTEXT DEFAULT '',
          content LONGTEXT DEFAULT '',
          placements LONGTEXT DEFAULT '[]',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        imageColumns: ['heroBannerImage']
      }
    ];
    
    for (const table of tableUpdates) {
      console.log(`   🔨 Processing ${table.name}...`);
      
      // Create table
      await connection.execute(table.sql);
      
      // Update image columns to LONGTEXT
      for (const column of table.imageColumns) {
        try {
          await connection.execute(`ALTER TABLE ${table.name} MODIFY COLUMN ${column} LONGTEXT DEFAULT ''`);
          console.log(`      ✅ ${column} updated to LONGTEXT`);
        } catch (error) {
          console.log(`      ⚠️  ${column}: ${error.message}`);
        }
      }
    }
    
    // Step 4: Test DirectorDesk operations
    console.log('\n🧪 Step 4: Testing DirectorDesk operations...');
    
    // Test inserting data with large image
    const testData = {
      heroTitle: 'TEST DIRECTOR DESK',
      heroBannerImage: 'data:image/png;base64,' + 'A'.repeat(50000), // Large base64 string
      mainHeading: 'Test Heading',
      content: '<p>Test content</p>',
      staffMembers: JSON.stringify([
        { name: 'Test Person', title: 'Test Title', image: 'data:image/png;base64,' + 'B'.repeat(10000) }
      ])
    };
    
    try {
      // Delete any existing test data
      await connection.execute(`DELETE FROM DirectorDesks WHERE heroTitle = 'TEST DIRECTOR DESK'`);
      
      // Insert test data
      await connection.execute(`
        INSERT INTO DirectorDesks (heroTitle, heroBannerImage, mainHeading, content, staffMembers) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        testData.heroTitle,
        testData.heroBannerImage,
        testData.mainHeading,
        testData.content,
        testData.staffMembers
      ]);
      
      console.log('   ✅ Test insert successful (large image data works!)');
      
      // Retrieve and verify
      const [rows] = await connection.execute(`SELECT * FROM DirectorDesks WHERE heroTitle = 'TEST DIRECTOR DESK'`);
      if (rows.length > 0) {
        console.log('   ✅ Test retrieve successful');
        console.log(`   📊 heroBannerImage size: ${rows[0].heroBannerImage.length} characters`);
        console.log(`   📊 staffMembers size: ${rows[0].staffMembers.length} characters`);
      }
      
      // Clean up test data
      await connection.execute(`DELETE FROM DirectorDesks WHERE heroTitle = 'TEST DIRECTOR DESK'`);
      console.log('   ✅ Test data cleaned up');
      
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`);
      console.log('   💡 This suggests there are still database issues');
    }
    
    // Step 5: Check column types
    console.log('\n🔍 Step 5: Verifying column types...');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'DirectorDesks'
      AND COLUMN_NAME LIKE '%Image%'
    `, [config.database]);
    
    columns.forEach(col => {
      const status = col.DATA_TYPE === 'longtext' ? '✅' : '❌';
      console.log(`   ${status} ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.DATA_TYPE})`);
    });
    
    await connection.end();
    
    console.log('\n🎉 Diagnosis and fix completed!');
    console.log('💡 Now try your Director Desk form submission - it should work!');
    console.log('💡 Also try the migration again - the "Data too long" errors should be resolved!');
    
  } catch (error) {
    console.error('❌ Diagnosis and fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

diagnoseAndFix();