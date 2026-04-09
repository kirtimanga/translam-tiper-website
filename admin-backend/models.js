const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Read DB config from environment. Fail fast with a clear message if required vars missing.
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';

if (!DB_NAME || !DB_USER) {
  console.error('\n❌ Missing required database environment variables.');
  console.error('Please create an `.env` file in `admin-backend/` or set the following env vars:');
  console.error('  DB_NAME, DB_USER, DB_PASSWORD (DB_PASSWORD can be empty if your DB allows it)');
  console.error('\nExample `.env` values (create `admin-backend/.env`):\n');
  console.error('  DB_HOST=localhost');
  console.error('  DB_NAME=translam');
  console.error('  DB_USER=root');
  console.error('  DB_PASSWORD=your_db_password\n');
  // Exit to avoid accidental connection attempts using default/empty credentials.
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false,
});

const Page = sequelize.define('Page', {
  slug: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
});

const Image = sequelize.define('Image', {
  url: DataTypes.STRING,
  alt: DataTypes.STRING,
  pageId: DataTypes.INTEGER,
});

const HomePage = sequelize.define('HomePage', {
  slug: { type: DataTypes.STRING, unique: true },
  heroSections: DataTypes.TEXT, // JSON stringified array
  successStudents: DataTypes.STRING,
  successRate: DataTypes.STRING,
  successQuestions: DataTypes.STRING,
  successExperts: DataTypes.STRING,
  successYears: DataTypes.STRING,
  institutions: DataTypes.TEXT, // JSON stringified array
  recruiters: DataTypes.TEXT, // JSON stringified array
  whyTitle: DataTypes.STRING,
  whyDesc: DataTypes.TEXT,
  placements: DataTypes.TEXT, // JSON stringified array
  toolsTitle: DataTypes.STRING,
  toolsDesc: DataTypes.TEXT,
  exploreCourses: DataTypes.TEXT, // JSON stringified array
  events: DataTypes.TEXT, // JSON stringified array
  testimonials: DataTypes.TEXT, // JSON stringified array
  footerText: DataTypes.TEXT
});

const AboutPage = sequelize.define('AboutPage', {
  slug: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
});

const AdmissionPage = sequelize.define('AdmissionPage', {
  slug: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  bannerImage: DataTypes.TEXT, // Changed to TEXT for large image data
});

const CoursesPage = sequelize.define('CoursesPage', {
  slug: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
});

const EventsPage = sequelize.define('EventsPage', {
  slug: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  bannerImage: DataTypes.TEXT, // Changed to TEXT for large image data
  gallery: DataTypes.TEXT, // JSON stringified array of image paths (for backward compatibility)
  sections: DataTypes.TEXT, // JSON stringified array of sections with images
});

const ContactPage = sequelize.define('ContactPage', {
  slug: { type: DataTypes.STRING, unique: true },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  // Hero Section Fields
  heroLabel: { type: DataTypes.STRING, defaultValue: 'GET STARTED' },
  heroHeading: { type: DataTypes.TEXT },
  // Contact Information Fields
  contactInfoTitle: { type: DataTypes.STRING, defaultValue: 'Contact Info' },
  contactInfoHeading: { type: DataTypes.TEXT },
  // Email Information
  emailLabel: { type: DataTypes.STRING, defaultValue: 'Email Address' },
  emailAddress: { type: DataTypes.STRING, defaultValue: 'help@info.com' },
  emailHours: { type: DataTypes.TEXT },
  // Phone Information
  phoneLabel: { type: DataTypes.STRING, defaultValue: 'Number' },
  phoneNumber: { type: DataTypes.STRING, defaultValue: '(808) 998-34256' },
  phoneHours: { type: DataTypes.TEXT },
  // Social Media Links
  facebookUrl: { type: DataTypes.STRING, defaultValue: '#' },
  instagramUrl: { type: DataTypes.STRING, defaultValue: '#' },
  twitterUrl: { type: DataTypes.STRING, defaultValue: '#' },
  // Banner Image
  bannerImage: { type: DataTypes.TEXT } // Changed to TEXT for large image data
});

const SmtpSettings = sequelize.define('SmtpSettings', {
  host: { type: DataTypes.STRING, allowNull: false },
  port: { type: DataTypes.INTEGER, defaultValue: 587 },
  secure: { type: DataTypes.BOOLEAN, defaultValue: false },
  username: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  fromEmail: { type: DataTypes.STRING, allowNull: false },
  fromName: { type: DataTypes.STRING, defaultValue: 'Translam Institute' },
  toEmail: { type: DataTypes.STRING, allowNull: true },
  placementEmail: { type: DataTypes.STRING, allowNull: true },
  alumniEmail: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Director Desk Model
const DirectorDesk = sequelize.define('DirectorDesk', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'DIRECTOR DESK' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  mainHeading: { type: DataTypes.STRING, defaultValue: 'Translam Group: Empowering Futures for 37 Glorious Years' },
  content: { type: DataTypes.TEXT },
  staffMembers: { type: DataTypes.TEXT } // JSON stringified array
});

// Philosophy Model  
const Philosophy = sequelize.define('Philosophy', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'PHILOSOPHY' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  mainQuote: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT }
});

// Home Slider Model
const HomeSlider = sequelize.define('HomeSlider', {
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.TEXT, allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// About Group Model
const AboutGroup = sequelize.define('AboutGroup', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'ABOUT US' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  buildingImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  aboutUsTitle: { type: DataTypes.STRING, defaultValue: 'About US' },
  aboutUsContent: { type: DataTypes.TEXT },
  visionImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  visionTitle: { type: DataTypes.STRING, defaultValue: 'Vision & Mission' },
  visionContent: { type: DataTypes.TEXT },
  missionContent: { type: DataTypes.TEXT },
  aimsImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  aimsTitle: { type: DataTypes.STRING, defaultValue: 'Aims & Objectives' },
  aimsObjectives: { type: DataTypes.TEXT } // JSON stringified array
});

// Outstanding Placements Model
const OutstandingPlacements = sequelize.define('OutstandingPlacements', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'OUTSTANDING PLACEMENTS' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  content: { type: DataTypes.TEXT },
  placements: { type: DataTypes.TEXT('long') } // JSON stringified array - using LONGTEXT for large data
});

// Testimonial Model
const Testimonial = sequelize.define('Testimonial', {
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, defaultValue: '' },
  image: { type: DataTypes.STRING, defaultValue: '' },
  content: { type: DataTypes.TEXT, allowNull: false },
  rating: { type: DataTypes.INTEGER, defaultValue: 5 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Why Choose Us Model
const WhyChooseUs = sequelize.define('WhyChooseUs', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'WHY CHOOSE US' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  content: { type: DataTypes.TEXT },
  points: { type: DataTypes.TEXT } // JSON stringified array
});

// Our Recruiters Model  
const OurRecruiters = sequelize.define('OurRecruiters', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'OUR RECRUITERS' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  content: { type: DataTypes.TEXT },
  recruiters: { type: DataTypes.TEXT } // JSON stringified array
});

// Our Institutions Model
const OurInstitutions = sequelize.define('OurInstitutions', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'OUR INSTITUTIONS' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  content: { type: DataTypes.TEXT },
  institutions: { type: DataTypes.TEXT } // JSON stringified array
});

// Our Success Model
const OurSuccess = sequelize.define('OurSuccess', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'OUR SUCCESS' },
  heroBannerImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  content: { type: DataTypes.TEXT },
  successStories: { type: DataTypes.TEXT } // JSON stringified array
});

// Placement Model
const Placement = sequelize.define('Placement', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'Placement' },
  heroImage: { type: DataTypes.TEXT }, // Changed to TEXT for large image data
  crcTitle: { type: DataTypes.STRING, defaultValue: 'Corporate Resource Center (CRC)' },
  crcDescription: { type: DataTypes.TEXT },
  crcContent: { type: DataTypes.TEXT },
  trainingTitle: { type: DataTypes.STRING, defaultValue: 'Training and Development' },
  trainingDescription: { type: DataTypes.TEXT },
  trainingFeatures: { type: DataTypes.TEXT('long') }, // JSON stringified array
  students: { type: DataTypes.TEXT('long') } // JSON stringified array
});

// Gallery Model
const Gallery = sequelize.define('Gallery', {
  heroImage: { type: DataTypes.STRING },
  heroTitle: { type: DataTypes.STRING }
});

// Gallery Section Model
const GallerySection = sequelize.define('GallerySection', {
  sectionName: { type: DataTypes.STRING, allowNull: false },
  sectionTitle: { type: DataTypes.STRING },
  galleryId: { type: DataTypes.INTEGER }
});

// Gallery Image Model  
const GalleryImage = sequelize.define('GalleryImage', {
  url: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  sectionId: { type: DataTypes.INTEGER },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Email Logs Model
const EmailLog = sequelize.define('EmailLog', {
  from: { type: DataTypes.STRING, allowNull: false },
  to: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('sent', 'failed', 'pending'), defaultValue: 'pending' },
  errorMessage: { type: DataTypes.TEXT },
  sentAt: { type: DataTypes.DATE },
  source: { type: DataTypes.STRING, defaultValue: 'contact-form' }, // contact-form, admin, etc.
  senderName: { type: DataTypes.STRING },
  senderEmail: { type: DataTypes.STRING },
  senderPhone: { type: DataTypes.STRING }
});

// Admission Form Model
const AdmissionForm = sequelize.define('AdmissionForm', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  course: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'processed', 'rejected'), defaultValue: 'pending' },
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT }
});

// Documents Page Model
const DocumentsPage = sequelize.define('DocumentsPage', {
  heroTitle: { type: DataTypes.STRING, defaultValue: 'DOCUMENTS' },
  heroBannerImage: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT }
});

// Document Section Model
const DocumentSection = sequelize.define('DocumentSection', {
  sectionName: { type: DataTypes.STRING, allowNull: false },
  sectionTitle: { type: DataTypes.STRING },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  documentsPageId: { type: DataTypes.INTEGER }
});

// Document Model
const Document = sequelize.define('Document', {
  documentName: { type: DataTypes.STRING, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
  fileSize: { type: DataTypes.INTEGER }, // in bytes
  fileType: { type: DataTypes.STRING }, // pdf, doc, docx, etc.
  description: { type: DataTypes.TEXT },
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  sectionId: { type: DataTypes.INTEGER }
});

// Define relationships
Page.hasMany(Image, { foreignKey: 'pageId' });
Image.belongsTo(Page, { foreignKey: 'pageId' });

Gallery.hasMany(GallerySection, { foreignKey: 'galleryId', as: 'sections' });
GallerySection.belongsTo(Gallery, { foreignKey: 'galleryId' });

GallerySection.hasMany(GalleryImage, { foreignKey: 'sectionId', as: 'images' });
GalleryImage.belongsTo(GallerySection, { foreignKey: 'sectionId' });

DocumentsPage.hasMany(DocumentSection, { foreignKey: 'documentsPageId', as: 'sections' });
DocumentSection.belongsTo(DocumentsPage, { foreignKey: 'documentsPageId' });

DocumentSection.hasMany(Document, { foreignKey: 'sectionId', as: 'documents' });
Document.belongsTo(DocumentSection, { foreignKey: 'sectionId' });

module.exports = { 
  sequelize, 
  Page, 
  Image, 
  HomePage, 
  AboutPage, 
  AdmissionPage, 
  CoursesPage, 
  EventsPage, 
  ContactPage, 
  SmtpSettings,
  DirectorDesk,
  Philosophy,
  HomeSlider,
  AboutGroup,
  OutstandingPlacements,
  Testimonial,
  WhyChooseUs,
  OurRecruiters,
  OurInstitutions,
  OurSuccess,
  Placement,
  Gallery,
  GallerySection,
  GalleryImage,
  EmailLog,
  AdmissionForm,
  DocumentsPage,
  DocumentSection,
  Document
};

// Uncomment for connection test
// sequelize.authenticate()
//   .then(() => console.log('MySQL connection successful'))
//   .catch(err => console.error('MySQL connection error:', err));