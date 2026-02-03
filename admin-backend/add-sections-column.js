require('dotenv').config();
const { sequelize } = require('./models');

async function addSectionsColumn() {
  try {
    console.log('Adding sections column to EventsPages table...');
    
    // Add the sections column
    await sequelize.query('ALTER TABLE EventsPages ADD COLUMN sections TEXT;');
    
    console.log('Sections column added successfully!');
    
    // Check the table structure
    const [results] = await sequelize.query('DESCRIBE EventsPages');
    console.log('\nEventsPages table structure:');
    results.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding sections column:', error);
    
    // Check if column already exists
    if (error.message.includes('Duplicate column name')) {
      console.log('Sections column already exists!');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

addSectionsColumn();