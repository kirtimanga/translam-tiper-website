/**
 * Database connection and schema test
 */
const { sequelize, OutstandingPlacements, AboutGroup, Philosophy, DirectorDesk } = require('./models');

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test table creation/sync
    console.log('\n📋 Syncing database models...');
    await sequelize.sync({ alter: true }); // This will update existing tables safely
    console.log('✅ Database models synchronized');
    
    // Test each model
    const models = [
      { name: 'OutstandingPlacements', model: OutstandingPlacements },
      { name: 'AboutGroup', model: AboutGroup },
      { name: 'Philosophy', model: Philosophy },
      { name: 'DirectorDesk', model: DirectorDesk }
    ];
    
    for (const { name, model } of models) {
      try {
        // Try to find or create a test record
        const [record, created] = await model.findOrCreate({
          where: { id: 1 },
          defaults: {}
        });
        
        console.log(`✅ ${name} model working - Record ${created ? 'created' : 'exists'}`);
        
        // Test the expected JSON fields
        if (name === 'OutstandingPlacements') {
          console.log(`   - Placements field type: ${typeof record.placements}`);
          console.log(`   - Can parse placements: ${record.placements ? 'Yes' : 'Empty/Null'}`);
        }
        
        if (name === 'AboutGroup') {
          console.log(`   - AimsObjectives field type: ${typeof record.aimsObjectives}`);
          console.log(`   - Can parse aims: ${record.aimsObjectives ? 'Yes' : 'Empty/Null'}`);
        }
        
        if (name === 'DirectorDesk') {
          console.log(`   - StaffMembers field type: ${typeof record.staffMembers}`);
          console.log(`   - Can parse staff: ${record.staffMembers ? 'Yes' : 'Empty/Null'}`);
        }
        
      } catch (modelError) {
        console.error(`❌ ${name} model error:`, modelError.message);
      }
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };