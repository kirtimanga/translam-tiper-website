const { sequelize } = require('./models');

async function fixPlacementsColumn() {
  try {
    console.log('🔧 Fixing placements column size...');
    
    // Check current column info
    const [currentInfo] = await sequelize.query(`
      SHOW COLUMNS FROM OutstandingPlacements WHERE Field = 'placements'
    `);
    console.log('Current column info:', currentInfo);
    
    // Update the column to LONGTEXT to handle large JSON data
    await sequelize.query(`
      ALTER TABLE OutstandingPlacements 
      MODIFY COLUMN placements LONGTEXT DEFAULT '[]'
    `);
    
    console.log('✅ Successfully updated placements column to LONGTEXT');
    
    // Verify the change
    const [updatedInfo] = await sequelize.query(`
      SHOW COLUMNS FROM OutstandingPlacements WHERE Field = 'placements'
    `);
    console.log('Updated column info:', updatedInfo);
    
  } catch (error) {
    console.error('❌ Error fixing placements column:', error);
  } finally {
    await sequelize.close();
  }
}

fixPlacementsColumn();