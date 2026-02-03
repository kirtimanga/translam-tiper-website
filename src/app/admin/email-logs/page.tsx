"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';

interface EmailLog {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: string;
  source: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailLogsResponse {
  emailLogs: EmailLog[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function EmailLogsManagement() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetchEmailLogs();
  }, [currentPage]);

  const fetchEmailLogs = async () => {
    try {
      // Try the regular endpoint first, then fallback to SMTP endpoint
  let response = await fetch(`${BASE_URL}/api/email-logs?page=${currentPage}&limit=20`);
      
      if (!response.ok) {
        // Try temporary endpoint
  response = await fetch(`${BASE_URL}/api/smtp/email-logs`);
      }
      
      if (!response.ok) {
        // If both fail, show empty state with message
        setEmailLogs([]);
        setTotalPages(1);
        return;
      }
      
      const data: EmailLogsResponse = await response.json();
      setEmailLogs(data.emailLogs || []);
      setTotalPages(data.totalPages || 1);
      
    } catch (error) {
      console.error('Error fetching email logs:', error);
      setEmailLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email log?')) return;

    try {
  const response = await fetch(`${BASE_URL}/api/email-logs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Email log deleted successfully!');
        fetchEmailLogs();
      }
    } catch (error) {
      console.error('Error deleting email log:', error);
      alert('Failed to delete email log');
    }
  };

  const handleResend = async (log: EmailLog) => {
    if (!confirm('Are you sure you want to resend this email?')) return;

    setResending(true);
    try {
  const response = await fetch(`${BASE_URL}/api/email-logs/${log.id}/resend`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Email resent successfully!');
        fetchEmailLogs();
      } else {
        alert(`Failed to resend email: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  const viewDetails = (log: EmailLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <AdminLayout title="Email Logs">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Email Logs">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#6b7280' }}>
          All emails sent through the system are logged here. You can view details, resend failed emails, or delete logs.
        </p>
        {emailLogs.length === 0 && !loading && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '12px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>⚠️ Email Logging Not Available</h3>
            <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
              Email logging requires the backend server to be restarted to load the new EmailLog model. 
              Currently, contact form submissions work but are not logged. 
              <strong> Please restart the backend server to enable full email logging functionality.</strong>
            </p>
          </div>
        )}
      </div>

      {/* Email Logs Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>To</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Subject</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>From</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Source</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', color: '#374151', fontSize: '14px' }}>
                  {formatDate(log.createdAt)}
                </td>
                <td style={{ padding: '12px', color: '#374151', fontSize: '14px' }}>
                  {log.to}
                </td>
                <td style={{ padding: '12px', color: '#374151', fontSize: '14px' }}>
                  {log.subject}
                </td>
                <td style={{ padding: '12px', color: '#374151', fontSize: '14px' }}>
                  {log.senderName && log.senderEmail ? 
                    `${log.senderName} (${log.senderEmail})` : 
                    log.from
                  }
                </td>
                <td style={{ padding: '12px', color: '#374151', fontSize: '14px' }}>
                  {log.source}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: `${getStatusColor(log.status)}20`,
                    color: getStatusColor(log.status)
                  }}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => viewDetails(log)}
                    style={{
                      padding: '6px 12px',
                      marginRight: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View
                  </button>
                  {log.status === 'failed' && (
                    <button
                      onClick={() => handleResend(log)}
                      disabled={resending}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: resending ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: resending ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Resend
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(log.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {emailLogs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                  No email logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', gap: '8px' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', color: '#374151' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Email Details Modal */}
      {showDetails && selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Email Details</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Status:</strong>{' '}
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: `${getStatusColor(selectedLog.status)}20`,
                color: getStatusColor(selectedLog.status)
              }}>
                {selectedLog.status.toUpperCase()}
              </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>Date:</strong> {formatDate(selectedLog.createdAt)}
            </div>

            {selectedLog.sentAt && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Sent At:</strong> {formatDate(selectedLog.sentAt)}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <strong>From:</strong> {selectedLog.from}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>To:</strong> {selectedLog.to}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>Subject:</strong> {selectedLog.subject}
            </div>

            {selectedLog.senderName && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Sender Name:</strong> {selectedLog.senderName}
              </div>
            )}

            {selectedLog.senderEmail && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Sender Email:</strong> {selectedLog.senderEmail}
              </div>
            )}

            {selectedLog.senderPhone && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Sender Phone:</strong> {selectedLog.senderPhone}
              </div>
            )}

            {selectedLog.errorMessage && (
              <div style={{ marginBottom: '12px', color: '#ef4444' }}>
                <strong>Error:</strong> {selectedLog.errorMessage}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <strong>Email Body:</strong>
              <div style={{
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }} dangerouslySetInnerHTML={{ __html: selectedLog.body }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  padding: '8px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}