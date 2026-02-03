const { sequelize, DocumentsPage, DocumentSection, Document } = require('./models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    console.log('Tables created/updated');
    
    // Try to create a test documents page
    let documentsPage = await DocumentsPage.findOne();
    if (!documentsPage) {
      documentsPage = await DocumentsPage.create({
        heroTitle: 'DOCUMENTS',
        heroBannerImage: '',
        content: ''
      });
      console.log('Created documents page:', documentsPage.id);
    } else {
      console.log('Documents page already exists:', documentsPage.id);
    }
    
    console.log('Document tables are ready');
    process.exit(0);
  } catch (error) {
    console.error('Database sync error:', error);
    process.exit(1);
  }
}

syncDatabase();