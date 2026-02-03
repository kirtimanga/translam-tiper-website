const { sequelize, OutstandingPlacements } = require('./models');

async function updateSchema() {
  try {
    console.log('🔧 Updating database schema...');
    
    // Force sync the OutstandingPlacements model to update the schema
    await OutstandingPlacements.sync({ alter: true });
    
    console.log('✅ Successfully updated OutstandingPlacements schema');
    
    // Test if we can now store large data
    const testData = {
      heroTitle: 'Test Outstanding Placements',
      content: 'Test content',
      placements: JSON.stringify([
        { name: 'Test Student 1', company: 'Test Company 1', package: '10 LPA' },
        { name: 'Test Student 2', company: 'Test Company 2', package: '12 LPA' },
        { name: 'Test Student 3', company: 'Test Company 3', package: '15 LPA' }
      ])
    };
    
    console.log('🧪 Testing with sample data...');
    
    let placement = await OutstandingPlacements.findOne();
    if (!placement) {
      placement = await OutstandingPlacements.create(testData);
      console.log('✅ Created test record successfully');
    } else {
      await placement.update(testData);
      console.log('✅ Updated test record successfully');
    }
    
    console.log('🎉 Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  updateSchema();
}

module.exports = { updateSchema };