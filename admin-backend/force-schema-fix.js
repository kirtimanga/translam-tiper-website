#!/usr/bin/env node
/**
 * Force schema fix - creates tables with correct structure if they don't exist
 * and modifies existing columns forcefully
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function forceSchemaFix() {
  console.log('🔨 Force Schema Fix - Creating/Updating Tables...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'translam',
    port: process.env.DB_PORT || 3306
  };
  
  try {
    const connection = await mysql.createConnection(config);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    await connection.execute(`USE \`${config.database}\``);
    
    console.log('✅ Using database:', config.database);
    
    // Define table structures with correct TEXT columns
    const tableDefinitions = [
      {
        name: 'AboutGroups',
        sql: `
          CREATE TABLE IF NOT EXISTS AboutGroups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            heroTitle VARCHAR(255) DEFAULT 'ABOUT US',
            heroBannerImage TEXT DEFAULT '',
            buildingImage TEXT DEFAULT '',
            aboutUsTitle VARCHAR(255) DEFAULT 'About US',
            aboutUsContent TEXT DEFAULT '',
            visionImage TEXT DEFAULT '',
            visionTitle VARCHAR(255) DEFAULT 'Vision & Mission',
            visionContent TEXT DEFAULT '',
            missionContent TEXT DEFAULT '',
            aimsImage TEXT DEFAULT '',
            aimsTitle VARCHAR(255) DEFAULT 'Aims & Objectives',
            aimsObjectives TEXT DEFAULT '[]',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `,
        imageColumns: ['heroBannerImage', 'buildingImage', 'visionImage', 'aimsImage']
      },
      {
        name: 'DirectorDesks',
        sql: `
          CREATE TABLE IF NOT EXISTS DirectorDesks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            heroTitle VARCHAR(255) DEFAULT 'DIRECTOR DESK',
            heroBannerImage TEXT DEFAULT '',
            mainHeading VARCHAR(255) DEFAULT 'Translam Group: Empowering Futures for 37 Glorious Years',
            content TEXT DEFAULT '',
            staffMembers TEXT DEFAULT '[]',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `,
        imageColumns: ['heroBannerImage']
      },
      {
        name: 'Philosophies',
        sql: `
          CREATE TABLE IF NOT EXISTS Philosophies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            heroTitle VARCHAR(255) DEFAULT 'PHILOSOPHY',
            heroBannerImage TEXT DEFAULT '',
            mainQuote TEXT DEFAULT '"Empowerment begins the moment a learner believes they can shape their own future—and education lights that belief."',
            content TEXT DEFAULT '',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `,
        imageColumns: ['heroBannerImage']
      },
      {
        name: 'OutstandingPlacements',
        sql: `
          CREATE TABLE IF NOT EXISTS OutstandingPlacements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            heroTitle VARCHAR(255) DEFAULT 'OUTSTANDING PLACEMENTS',
            heroBannerImage TEXT DEFAULT '',
            content TEXT DEFAULT '',
            placements LONGTEXT DEFAULT '[]',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `,
        imageColumns: ['heroBannerImage']
      }
    ];
    
    // Process each table
    for (const table of tableDefinitions) {
      console.log(`🔨 Processing ${table.name}...`);
      
      // Create table with correct structure
      await connection.execute(table.sql);
      console.log(`   ✅ Table created/exists`);
      
      // Force modify each image column to TEXT (in case table existed with wrong types)
      for (const column of table.imageColumns) {
        try {
          await connection.execute(`
            ALTER TABLE ${table.name} 
            MODIFY COLUMN ${column} TEXT DEFAULT ''
          `);
          console.log(`   ✅ ${column} set to TEXT`);
        } catch (error) {
          if (error.message.includes("doesn't exist")) {
            console.log(`   ⚠️  Column ${column} doesn't exist - will be created correctly`);
          } else {
            console.log(`   ❌ Error modifying ${column}: ${error.message}`);
          }
        }
      }
      console.log('');
    }
    
    await connection.end();
    console.log('🎉 Force schema fix completed!');
    console.log('💡 Now try your migration again - it should work!');
    
  } catch (error) {
    console.error('❌ Force schema fix failed:', error.message);
    process.exit(1);
  }
}

forceSchemaFix();