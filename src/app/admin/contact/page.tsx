"use client";
import { useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import AdminLayout from '@/components/AdminLayout';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';

interface ContactData {
  id?: number;
  slug: string;
  title: string;
  content: string;
  heroLabel: string;
  heroHeading: string;
  contactInfoTitle: string;
  contactInfoHeading: string;
  emailLabel: string;
  emailAddress: string;
  emailHours: string;
  phoneLabel: string;
  phoneNumber: string;
  phoneHours: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  bannerImage: string;
}

export default function ContactManagement() {
  const [contactData, setContactData] = useState<ContactData>({
    slug: 'contact',
    title: 'Contact Us',
    content: '',
    heroLabel: 'GET STARTED',
    heroHeading: 'Get in touch with us.\nWe\'re here to assist you.',
    contactInfoTitle: 'Contact Info',
    contactInfoHeading: 'We are always\nhappy to assist you',
    emailLabel: 'Email Address',
    emailAddress: 'help@info.com',
    emailHours: 'Assistance hours:\nMonday - Friday 6 am to 8 pm EST',
    phoneLabel: 'Number',
    phoneNumber: '(808) 998-34256',
    phoneHours: 'Assistance hours:\nMonday - Friday 6 am to 8 pm EST',
    facebookUrl: '#',
    instagramUrl: '#',
    twitterUrl: '#',
    bannerImage: '/images/commonBanner.png'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
  const response = await fetch(`${BASE_URL}/api/contact`);
      if (response.ok) {
        const data = await response.json();
        setContactData(data);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        const data = await response.json();
        handleApiResponse(data);
        setMessage({ type: 'success', text: 'Contact information updated successfully!' });
      } else {
        showAlert('error', 'Failed to update contact information');
        setMessage({ type: 'error', text: 'Failed to update contact information' });
      }
    } catch (error) {
      showAlert('error', 'An error occurred while saving');
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ContactData, value: string) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="Contact Information Management">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contact Information Management">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '20px'
        }}>
          {message && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fca5a5'}`
            }}>
              {message.text}
            </div>
          )}

          {/* Banner Image Upload */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Banner Image
            </h3>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Current Banner Image
              </label>
                  {contactData.bannerImage && (
                <div style={{ marginBottom: '16px' }}>
                  <img 
                    src={`${BASE_URL}${contactData.bannerImage}`} 
                    alt="Contact Banner" 
                    style={{ 
                      maxWidth: '300px', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '1px solid #d1d5db'
                    }} 
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Upload New Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('banner', file);
                      
                      try {
                        const response = await fetch(`${BASE_URL}/api/contact/banner`, {
                          method: 'POST',
                          body: formData,
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          setContactData(prev => ({ ...prev, bannerImage: data.bannerImage }));
                          showAlert('success', 'Banner image uploaded successfully!');
                          setMessage({ type: 'success', text: 'Banner image uploaded successfully!' });
                        } else {
                          showAlert('error', 'Failed to upload banner image');
                          setMessage({ type: 'error', text: 'Failed to upload banner image' });
                        }
                      } catch (error) {
                        showAlert('error', 'An error occurred while uploading');
                        setMessage({ type: 'error', text: 'An error occurred while uploading' });
                      }
                    }
                  }}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Hero Section
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Hero Label
                </label>
                <input
                  type="text"
                  value={contactData.heroLabel}
                  onChange={(e) => handleInputChange('heroLabel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Hero Heading
                </label>
                <textarea
                  value={contactData.heroHeading}
                  onChange={(e) => handleInputChange('heroHeading', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Contact Information Section
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Section Title
                </label>
                <input
                  type="text"
                  value={contactData.contactInfoTitle}
                  onChange={(e) => handleInputChange('contactInfoTitle', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Section Heading
                </label>
                <textarea
                  value={contactData.contactInfoHeading}
                  onChange={(e) => handleInputChange('contactInfoHeading', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Email Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Email Information
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Email Label
                </label>
                <input
                  type="text"
                  value={contactData.emailLabel}
                  onChange={(e) => handleInputChange('emailLabel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Email Hours
                </label>
                <textarea
                  value={contactData.emailHours}
                  onChange={(e) => handleInputChange('emailHours', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Phone Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Phone Information
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Phone Label
                </label>
                <input
                  type="text"
                  value={contactData.phoneLabel}
                  onChange={(e) => handleInputChange('phoneLabel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Phone Hours
                </label>
                <textarea
                  value={contactData.phoneHours}
                  onChange={(e) => handleInputChange('phoneHours', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Social Media Links
            </h3>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={contactData.facebookUrl}
                  onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={contactData.instagramUrl}
                  onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={contactData.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? '#9ca3af' : '#7c3aed',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Contact Information'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}