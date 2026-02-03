"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';

interface SmtpSettings {
  id?: number;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  isActive: boolean;
}

export default function SmtpManagement() {
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSmtpSettings();
  }, []);

  const fetchSmtpSettings = async () => {
    try {
  const response = await fetch(`${BASE_URL}/api/smtp`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received SMTP settings from API:', data);
        setSmtpSettings(data);
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      console.log('Sending SMTP settings:', smtpSettings);
  const response = await fetch(`${BASE_URL}/api/smtp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpSettings),
      });

      if (response.ok) {
        alert('SMTP settings updated successfully!');
      } else {
        alert('Failed to update SMTP settings');
      }
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
      alert('An error occurred while updating');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!smtpSettings) return;
    
    setTesting(true);
    setTestResult(null);

    try {
  const response = await fetch(`${BASE_URL}/api/smtp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpSettings),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof SmtpSettings, value: string | number | boolean) => {
    console.log(`Updating field ${field} with value:`, value);
    setSmtpSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <AdminLayout title="SMTP Settings">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SMTP Settings">
      <form onSubmit={handleSubmit}>
        {/* SMTP Configuration */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            SMTP Server Configuration
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                SMTP Host *
              </label>
              <input
                type="text"
                value={smtpSettings?.host || ''}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="smtp.gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Port *
              </label>
              <input
                type="number"
                value={smtpSettings?.port || 587}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#374151', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={smtpSettings?.secure || false}
                onChange={(e) => handleInputChange('secure', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Use SSL/TLS (for port 465)
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Username *
              </label>
              <input
                type="text"
                value={smtpSettings?.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="your-email@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={smtpSettings?.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Your app password"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    paddingRight: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Email Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                From Email *
              </label>
              <input
                type="email"
                value={smtpSettings?.fromEmail || ''}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                placeholder="noreply@translam.com"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                From Name
              </label>
              <input
                type="text"
                value={smtpSettings?.fromName || ''}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                placeholder="Translam Institute"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              To Email *
            </label>
            <input
              type="email"
              value={smtpSettings?.toEmail || ''}
              onChange={(e) => handleInputChange('toEmail', e.target.value)}
              placeholder="admin@translam.com"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <p style={{ marginTop: '4px', color: '#6b7280', fontSize: '13px' }}>
              All emails will be sent to this email address
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#374151', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={smtpSettings?.isActive || false}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Enable SMTP (Use this configuration for sending emails)
            </label>
          </div>
        </div>

        {/* Test Connection */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Test Connection
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !smtpSettings?.host || !smtpSettings?.username}
              style={{
                backgroundColor: testing ? '#9ca3af' : '#f59e0b',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: testing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginRight: '12px'
              }}
            >
              {testing ? 'Testing...' : 'Test SMTP Connection'}
            </button>
          </div>

          {testResult && (
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: testResult.success ? '#d1fae5' : '#fee2e2',
              border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
              color: testResult.success ? '#065f46' : '#991b1b'
            }}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {saving ? 'Saving...' : 'Save SMTP Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}