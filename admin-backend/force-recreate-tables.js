#!/usr/bin/env node
/**
 * Force recreate tables with correct schema
 * This will backup data, drop tables, and recreate with LONGTEXT columns
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function forceRecreateTable() {
  console.log('🔨 Force Recreate Tables with Correct Schema\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'translam',
    port: process.env.DB_PORT || 3306
  };
  
  try {
    const connection = await mysql.createConnection(config);
    await connection.execute(`USE \`${config.database}\``);
    
    console.log('✅ Connected to database\n');
    
    // Step 1: Backup existing data
    console.log('💾 Step 1: Backing up existing data...');
    
    let backupData = null;
    try {
      const [rows] = await connection.execute('SELECT * FROM DirectorDesks LIMIT 1');
      if (rows.length > 0) {
        backupData = rows[0];
        console.log('✅ Backed up existing DirectorDesk record');
        console.log('📊 Backup data:', {
          id: backupData.id,
          heroTitle: backupData.heroTitle,
          hasHeroBannerImage: !!backupData.heroBannerImage,
          heroBannerImageLength: backupData.heroBannerImage ? backupData.heroBannerImage.length : 0,
          hasContent: !!backupData.content,
          hasStaffMembers: !!backupData.staffMembers
        });
      } else {
        console.log('ℹ️ No existing data to backup');
      }
    } catch (error) {
      console.log('ℹ️ Table doesn\'t exist yet, no data to backup');
    }
    
    // Step 2: Drop existing table
    console.log('\n🗑️ Step 2: Dropping existing table...');
    try {
      await connection.execute('DROP TABLE IF EXISTS DirectorDesks');
      console.log('✅ DirectorDesks table dropped');
    } catch (error) {
      console.log('⚠️ Error dropping table:', error.message);
    }
    
    // Step 3: Create new table with correct schema
    console.log('\n🏗️ Step 3: Creating new table with LONGTEXT columns...');
    
    const createTableSQL = `
      CREATE TABLE DirectorDesks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        heroTitle VARCHAR(255) DEFAULT 'DIRECTOR DESK',
        heroBannerImage LONGTEXT,
        mainHeading TEXT DEFAULT 'Translam Group: Empowering Futures for 37 Glorious Years',
        content LONGTEXT,
        staffMembers LONGTEXT DEFAULT '[]',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ DirectorDesks table created with LONGTEXT columns');
    
    // Step 4: Verify column types
    console.log('\n🔍 Step 4: Verifying column types...');
    
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
    
    // Step 5: Restore backed up data (if any)
    if (backupData) {
      console.log('\n📥 Step 5: Restoring backed up data...');
      
      try {
        await connection.execute(`
          INSERT INTO DirectorDesks (heroTitle, heroBannerImage, mainHeading, content, staffMembers) 
          VALUES (?, ?, ?, ?, ?)
        `, [
          backupData.heroTitle || 'DIRECTOR DESK',
          backupData.heroBannerImage || '',
          backupData.mainHeading || 'Translam Group: Empowering Futures for 37 Glorious Years',
          backupData.content || '',
          backupData.staffMembers || '[]'
        ]);
        console.log('✅ Data restored successfully');
      } catch (error) {
        console.log('⚠️ Error restoring data:', error.message);
        console.log('💡 You may need to re-enter your Director Desk content');
      }
    } else {
      console.log('\n📝 Step 5: Creating default record...');
      await connection.execute(`
        INSERT INTO DirectorDesks (heroTitle, heroBannerImage, mainHeading, content, staffMembers) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'DIRECTOR DESK',
        '',
        'Translam Group: Empowering Futures for 37 Glorious Years',
        '<p>Welcome to Director Desk. Please update this content.</p>',
        '[]'
      ]);
      console.log('✅ Default record created');
    }
    
    // Step 6: Test with large data
    console.log('\n🧪 Step 6: Testing with large image data...');
    
    const testLargeImage = 'data:image/png;base64,' + 'A'.repeat(100000); // 100KB base64
    
    try {
      await connection.execute(`
        INSERT INTO DirectorDesks (heroTitle, heroBannerImage, mainHeading, content, staffMembers) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'TEST LARGE IMAGE',
        testLargeImage,
        'Test Heading',
        '<p>Test content</p>',
        JSON.stringify([{name: 'Test', title: 'Test', image: testLargeImage}])
      ]);
      
      console.log('✅ Large image data test PASSED!');
      
      // Clean up test record
      await connection.execute(`DELETE FROM DirectorDesks WHERE heroTitle = 'TEST LARGE IMAGE'`);
      console.log('✅ Test record cleaned up');
      
    } catch (error) {
      console.log('❌ Large image data test FAILED:', error.message);
    }
    
    await connection.end();
    
    console.log('\n🎉 Table recreation completed successfully!');
    console.log('💡 Now try saving your Director Desk form - it should work!');
    
  } catch (error) {
    console.error('❌ Force recreation failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

forceRecreateTable();