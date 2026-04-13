'use client';
import React, { useState, useEffect } from 'react';
import styles from './AdmissionEnquiryPopup.module.scss';
import apiFetch from '@/utils/apiFetch';

interface AdmissionEnquiryPopupProps {
  autoOpen?: boolean;
  autoOpenDelay?: number; // ms delay before auto-opening
  open?: boolean;
  onClose?: () => void;
}

function AdmissionEnquiryPopup({ autoOpen = false, autoOpenDelay = 2000, open, onClose }: AdmissionEnquiryPopupProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      if (!val) onClose?.();
    } else {
      setInternalOpen(val);
    }
  };
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    course: '',
    address: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, autoOpenDelay);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, autoOpenDelay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await apiFetch('/api/admission/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('sent');
        setFormData({ fullName: '', email: '', phone: '', course: '', address: '' });
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 2500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
        <h3 className={styles.title}>Admission Enquiry</h3>
        <p className={styles.subtitle}>Fill in your details and we&apos;ll get back to you</p>

        {status === 'sent' ? (
          <p className={styles.success}>Thank you! Your enquiry has been submitted successfully.</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.gridRow}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name *"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className={styles.gridRow}>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                required
                value={formData.phone}
                onChange={handleChange}
              />
              <select name="course" value={formData.course} onChange={handleChange} required>
                <option value="" disabled>Select Course *</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
              </select>
            </div>
            <textarea
              name="address"
              placeholder="Address (Optional)"
              rows={2}
              value={formData.address}
              onChange={handleChange}
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Submitting...' : 'Submit Enquiry'}
            </button>
            {status === 'error' && <p className={styles.error}>Something went wrong. Please try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default AdmissionEnquiryPopup;
