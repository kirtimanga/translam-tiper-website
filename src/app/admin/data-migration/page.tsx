"use client";
import AdminLayout from '@/components/AdminLayout';
import DataMigration from '@/components/DataMigration';

export default function DataMigrationPage() {
  return (
    <AdminLayout title="Data Migration">
      <DataMigration />
      
      {/* Information Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          About Data Migration
        </h3>
        
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              What does this migration do?
            </h4>
            <p style={{
              color: '#6b7280',
              lineHeight: '1.6',
              margin: 0
            }}>
              This migration transfers all data from browser localStorage to the database. Previously, admin data was stored 
              locally in your browser, which meant it could be lost if you cleared browser data or switched devices. 
              Now all data is permanently stored in the database.
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Which data gets migrated?
            </h4>
            <ul style={{
              color: '#6b7280',
              lineHeight: '1.6',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li>Our Success data (statistics and content)</li>
              <li>Our Institutions data (institution details and information)</li>
              <li>Our Recruiters data (recruiter logos and information)</li>
              <li>Testimonials (student testimonials and reviews)</li>
              <li>Why Choose Us data (reasons and highlights)</li>
              <li>Outstanding Placements data (student placement details)</li>
              <li>Home Slider data (homepage carousel slides)</li>
              <li>About Group data (about us, vision, mission, objectives)</li>
              <li>Our Philosophy data (philosophy content and quotes)</li>
              <li>Director's Desk data (director information and staff)</li>
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              What happens after migration?
            </h4>
            <ul style={{
              color: '#6b7280',
              lineHeight: '1.6',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li>All admin pages will load data from the database</li>
              <li>Changes will be automatically saved to the database</li>
              <li>Data will persist across browser sessions and devices</li>
              <li>localStorage data will be removed after successful migration</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            padding: '12px',
            borderRadius: '6px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <strong>Important:</strong> This migration is typically only needed once when upgrading from localStorage-based 
            storage to database storage. If you're setting up a fresh installation, no migration is needed.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}