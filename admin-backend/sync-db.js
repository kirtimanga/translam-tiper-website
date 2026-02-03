require('dotenv').config();
const { sequelize, AdmissionPage, ContactPage } = require('./models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    console.log('This will update the AdmissionPage and ContactPage tables with new fields.');
    
    // This will alter the table to match the model
    await sequelize.sync({ alter: true });
    
    console.log('Database synchronized successfully!');
    console.log('AdmissionPage table should now have the bannerImage column.');
    console.log('ContactPage table should now have all contact management fields.');
    
    // Check if AdmissionPage exists
    const admissionCount = await AdmissionPage.count();
    console.log(`Found ${admissionCount} admission page entries.`);
    
    // Check if ContactPage exists
    const contactCount = await ContactPage.count();
    console.log(`Found ${contactCount} contact page entries.`);
    
    // Describe the AdmissionPages table
    const [admissionResults] = await sequelize.query('DESCRIBE AdmissionPages');
    console.log('\nAdmissionPages table structure:');
    admissionResults.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
    // Describe the ContactPages table
    const [contactResults] = await sequelize.query('DESCRIBE ContactPages');
    console.log('\nContactPages table structure:');
    contactResults.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();
