"use client";
import AdminLayout from '@/components/AdminLayout';

export default function CoursesManagement() {
  return (
    <AdminLayout title="Courses Management">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Courses Content
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Courses management functionality will be implemented here.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}