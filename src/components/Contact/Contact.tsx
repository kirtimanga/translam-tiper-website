"use client";

import React, { useState, useEffect } from 'react';
import styles from './Contact.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';
import { BASE_URL } from '../../utils/baseUrl';
import apiFetch from '@/utils/apiFetch';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

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


const Contact = () => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await apiFetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setContactData(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching contact data:', error.message);
      } else {
        console.error('Error fetching contact data:', String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await apiFetch('/api/contact/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Your message has been sent successfully!'
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
  <CommonBanner title="CONTACT US" imgSrc={contactData && (contactData as ContactData).bannerImage ? `${BASE_URL}${(contactData as ContactData).bannerImage}` : "/images/commonBanner.png"} />
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </>
    );
  }

  if (!contactData) {
    return (
      <>
  <CommonBanner title="CONTACT US" imgSrc={contactData && (contactData as ContactData).bannerImage ? `${BASE_URL}${(contactData as ContactData).bannerImage}` : "/images/commonBanner.png"} />
        <div style={{ textAlign: 'center', padding: '40px' }}>Error loading contact information</div>
      </>
    );
  }

  return (
  <>
    <CommonBanner title="CONTACT US" imgSrc={contactData.bannerImage ? `${BASE_URL}${contactData.bannerImage}` : "/images/commonBanner.png"} />

    <div className={styles.contactPage}>
    
      {/* Hero Section */}
       <div className='container'>
      <section className={styles.hero}>
        <div className={styles.left}>
          <small>{contactData.heroLabel}</small>
          <h1 style={{ whiteSpace: 'pre-line' }}>{contactData.heroHeading}</h1>
        </div>
        <div className={styles.right}>
          <a href={contactData.facebookUrl}><FaFacebookF /></a>
          <a href={contactData.instagramUrl}><FaInstagram /></a>
        </div>
      </section>
</div>
      {/* Contact Form */}
      <div className='container'>
      <section className={styles.formSection}>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputsRow}>
            <input 
              type="text" 
              name="name"
              placeholder="Your Name" 
              value={formData.name}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="text" 
              name="phone"
              placeholder="Phone Number (optional)" 
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <textarea 
            name="message"
            placeholder="Message" 
            rows={5} 
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
          
          {submitStatus && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '6px',
              backgroundColor: submitStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
              border: `1px solid ${submitStatus.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: submitStatus.type === 'success' ? '#065f46' : '#991b1b'
            }}>
              {submitStatus.message}
            </div>
          )}
          
          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Leave us a Message →'}
          </button>
        </form>
      </section>
      </div>

      {/* Contact Info */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.block} style={{border:'none'}}>
            <h5>{contactData.contactInfoTitle}</h5>
            <h2 style={{ whiteSpace: 'pre-line' }}>{contactData.contactInfoHeading}</h2>
          </div>
          <div className={styles.block}>
            <h5>{contactData.emailLabel}</h5>
            <p><strong>{contactData.emailAddress}</strong></p>
            <span style={{ whiteSpace: 'pre-line' }}>{contactData.emailHours}</span>
          </div>
          <div className={styles.block}>
            <h5>{contactData.phoneLabel}</h5>
            <p><strong>{contactData.phoneNumber}</strong></p>
            <span style={{ whiteSpace: 'pre-line' }}>{contactData.phoneHours}</span>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <div className={styles.map}>
        <iframe
          src="https://maps.google.com/maps?width=100%&height=400&hl=en&q=Translam Group of Institutions Mawana Road, Meerut – 250001&t=&z=14&ie=UTF8&iwloc=B&output=embed"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </>
  );
};

export default Contact;
