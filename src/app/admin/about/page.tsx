"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AboutManagement() {
  const [activeSection, setActiveSection] = useState('About Group');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const sections = ['About Group', 'Our Philosophy', 'Directors Desk'];

  const renderSectionContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{activeSection} Content</h3>
          <textarea 
            className="w-full p-3 border rounded-lg h-32 resize-none"
            placeholder={`Enter ${activeSection.toLowerCase()} content...`}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Section Image</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                Upload Image
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save Changes
          </button>
          <button className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Preview
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '32px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px'
          }}>About Us Management</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Section Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeSection === section 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Management */}
            <div className="lg:col-span-3">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}