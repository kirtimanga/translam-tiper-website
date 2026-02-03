const { sequelize } = require('./models');

async function addGalleryIsActiveColumn() {
  try {
    console.log('🔧 Adding isActive column to GalleryImages table...');
    
    // Add isActive column to GalleryImages table
    await sequelize.query(`
      ALTER TABLE GalleryImages 
      ADD COLUMN isActive BOOLEAN DEFAULT TRUE
    `);
    
    console.log('✅ Successfully added isActive column to GalleryImages table');
    
    // Update existing records to be active by default
    await sequelize.query(`
      UPDATE GalleryImages 
      SET isActive = TRUE 
      WHERE isActive IS NULL
    `);
    
    console.log('✅ Updated existing images to be active');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️ isActive column already exists in GalleryImages table');
    } else {
      console.error('❌ Error adding isActive column:', error.message);
      throw error;
    }
  }
}

// Run the function and close connection
addGalleryIsActiveColumn()
  .then(() => {
    console.log('🎉 Database update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update database:', error);
    process.exit(1);
  });