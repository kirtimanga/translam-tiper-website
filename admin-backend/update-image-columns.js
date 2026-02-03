/**
 * Database schema update script to change image columns from VARCHAR to TEXT
 * Run this script to fix the "Data too long for column" errors
 */

// Ensure environment variables are loaded
require('dotenv').config();

const { sequelize } = require('./models');

async function updateImageColumns(closeConnection = true) {
  try {
    console.log('🔧 Starting database schema update...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Update image columns to TEXT type for better large data handling
    const updates = [
      // AboutGroup model
      'ALTER TABLE AboutGroups MODIFY COLUMN heroBannerImage TEXT',
      'ALTER TABLE AboutGroups MODIFY COLUMN buildingImage TEXT',
      'ALTER TABLE AboutGroups MODIFY COLUMN visionImage TEXT',
      'ALTER TABLE AboutGroups MODIFY COLUMN aimsImage TEXT',
      
      // DirectorDesk model
      'ALTER TABLE DirectorDesks MODIFY COLUMN heroBannerImage TEXT',
      
      // Philosophy model
      'ALTER TABLE Philosophies MODIFY COLUMN heroBannerImage TEXT',
      
      // OutstandingPlacements model
      'ALTER TABLE OutstandingPlacements MODIFY COLUMN heroBannerImage TEXT',
      
      // WhyChooseUs model
      'ALTER TABLE WhyChooseUs MODIFY COLUMN heroBannerImage TEXT',
      
      // OurRecruiters model
      'ALTER TABLE OurRecruiters MODIFY COLUMN heroBannerImage TEXT',
      
      // OurInstitutions model
      'ALTER TABLE OurInstitutions MODIFY COLUMN heroBannerImage TEXT',
      
      // OurSuccess model
      'ALTER TABLE OurSuccesses MODIFY COLUMN heroBannerImage TEXT',
      
      // Other banner image fields
      'ALTER TABLE AdmissionPages MODIFY COLUMN bannerImage TEXT',
      'ALTER TABLE EventsPages MODIFY COLUMN bannerImage TEXT',
      'ALTER TABLE ContactPages MODIFY COLUMN bannerImage TEXT'
    ];
    
    console.log('📝 Executing column updates...');
    
    for (let i = 0; i < updates.length; i++) {
      const sql = updates[i];
      try {
        console.log(`   ${i + 1}/${updates.length}: ${sql.split(' ')[2]} ${sql.split(' ')[3]}...`);
        await sequelize.query(sql);
        console.log(`   ✅ Updated successfully`);
      } catch (error) {
        if (error.message.includes('Unknown column') || error.message.includes("doesn't exist")) {
          console.log(`   ⚠️  Table/Column doesn't exist yet - will be created with correct type`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔄 Syncing all models to ensure schema is up to date...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database sync completed');
    
    console.log('\n🎉 Schema update completed! All image columns are now TEXT type.');
    console.log('💡 You can now run the migration without "Data too long" errors.');
    
    return { success: true, message: 'Schema update completed successfully' };
    
  } catch (error) {
    console.error('❌ Schema update failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    if (closeConnection) {
      await sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the update
if (require.main === module) {
  updateImageColumns();
}

module.exports = { updateImageColumns };