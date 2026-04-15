"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/baseUrl';
import apiFetch from '@/utils/apiFetch';
import styles from './Admission.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';
import { sanitizeRichHtml } from '@/utils/sanitizeHtml';

interface AdmissionData {
  id: number;
  title: string | null;
  content: string;
  bannerImage: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  address: string;
}

const Admission = () => {
  const [admissionData, setAdmissionData] = useState<AdmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    course: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAdmissionData();
  }, []);

  const fetchAdmissionData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/admission');
      if (response.ok) {
        const data = await response.json();
        setAdmissionData(data);
      } else {
        setError('Failed to fetch admission data');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching admission data:', error.message);
      } else {
        console.error('Error fetching admission data:', String(error));
      }
      setError('Error loading admission data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await apiFetch('/api/admission/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: data.message || 'Form submitted successfully!' });
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          course: '',
          address: ''
        });
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Failed to submit form. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading admission information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const bannerImage = admissionData?.bannerImage 
  ? `${BASE_URL}${admissionData.bannerImage}`
    : "/images/commonBanner.png";

  return (
    <>
      <CommonBanner title="ADMISSION" imgSrc={bannerImage} />

      <section id="admission-procedure" className={styles.admissionsection}>
        <div className="container">
          {admissionData?.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(admissionData.content) }}
              className={styles.admissionContent}
            />
          ) : (
            <div>
              <h2><span>Admission</span> Procedure</h2>
              <p>No admission content available. Please check back later.</p>
            </div>
          )}
        </div>
      </section>

  
      <section className={styles.admissionSection}>

        {/* 4. Admission Form */}
        <div className={styles.formSection}>
          <h3><span>Admission</span> Form</h3>
          {submitMessage && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '20px', 
              borderRadius: '5px',
              backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: submitMessage.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${submitMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {submitMessage.text}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <input 
                type="text" 
                name="fullName"
                placeholder="Full Name" 
                value={formData.fullName}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone No" 
                value={formData.phone}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="text" 
                name="course"
                placeholder="Course" 
                value={formData.course}
                onChange={handleInputChange}
                required 
              />
            </div>
            <textarea 
              name="address"
              placeholder="Address (Optional)"
              value={formData.address}
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '10px', 
                borderRadius: '5px',
                border: '1px solid #ddd',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Admission;
