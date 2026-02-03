"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Alert from '@/components/Alert';
import apiFetch from '@/utils/apiFetch';
import { useAlert } from '@/hooks/useAlert';

interface AdmissionFormData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  address: string | null;
  status: 'pending' | 'processed' | 'rejected';
  submittedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdmissionFormsPage() {
  const [admissionForms, setAdmissionForms] = useState<AdmissionFormData[]>([]);
  const [filteredForms, setFilteredForms] = useState<AdmissionFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<AdmissionFormData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'processed' | 'rejected'>('pending');
  const { alert, showAlert, hideAlert } = useAlert();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processed' | 'rejected'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchAdmissionForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [admissionForms, searchQuery, statusFilter, dateFilter]);

  const fetchAdmissionForms = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/admission-forms');
      if (response.ok) {
        const data = await response.json();
        setAdmissionForms(data);
      } else {
        showAlert('error', 'Failed to fetch admission forms');
      }
    } catch (error) {
      showAlert('error', 'Error fetching admission forms');
    } finally {
      setLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = [...admissionForms];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(form => 
        form.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.phone.includes(searchQuery) ||
        form.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => form.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(form => {
        const formDate = new Date(form.submittedAt);
        
        switch (dateFilter) {
          case 'today':
            return formDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return formDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return formDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredForms(filtered);
  };

  const handleViewDetails = (form: AdmissionFormData) => {
    setSelectedForm(form);
    setNotes(form.notes || '');
    setStatus(form.status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedForm) return;

    try {
      const response = await apiFetch(`/api/admission-forms/${selectedForm.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        showAlert('success', 'Status updated successfully');
        setShowModal(false);
        fetchAdmissionForms();
      } else {
        showAlert('error', 'Failed to update status');
      }
    } catch (error) {
      showAlert('error', 'Error updating status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this admission form?')) return;

    try {
      const response = await apiFetch(`/api/admission-forms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showAlert('success', 'Admission form deleted successfully');
        fetchAdmissionForms();
      } else {
        showAlert('error', 'Failed to delete admission form');
      }
    } catch (error) {
      showAlert('error', 'Error deleting admission form');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706' },
      processed: { bg: '#d1fae5', text: '#047857' },
      rejected: { bg: '#fee2e2', text: '#dc2626' }
    };
    
    const style = colors[status as keyof typeof colors] || colors.pending;
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: style.bg,
        color: style.text,
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Admission Forms">
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <p>Loading admission forms...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admission Forms">
      {alert && <Alert type={alert.type} message={alert.message} onClose={hideAlert} />}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            Admission Form Submissions
          </h2>
          <p style={{ color: '#6b7280' }}>
            Manage and process admission form submissions
          </p>
        </div>

        {/* Filters Section */}
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search by name, email, phone, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
            </select>
          </div>

          {/* Results Count */}
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            Showing {filteredForms.length} of {admissionForms.length} entries
          </div>
        </div>

        {admissionForms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#6b7280' }}>No admission forms submitted yet</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#6b7280' }}>No forms match your filter criteria</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Course</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Submitted</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((form) => (
                  <tr key={form.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', color: '#374151' }}>{form.fullName}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>{form.email}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>{form.phone}</td>
                    <td style={{ padding: '12px', color: '#374151' }}>{form.course}</td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(form.status)}</td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '14px' }}>
                      {new Date(form.submittedAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleViewDetails(form)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginRight: '8px'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(form.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for viewing details */}
        {showModal && selectedForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                Admission Form Details
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <p><strong>Name:</strong> {selectedForm.fullName}</p>
                <p><strong>Email:</strong> {selectedForm.email}</p>
                <p><strong>Phone:</strong> {selectedForm.phone}</p>
                <p><strong>Course:</strong> {selectedForm.course}</p>
                {selectedForm.address && <p><strong>Address:</strong> {selectedForm.address}</p>}
                <p><strong>Submitted:</strong> {new Date(selectedForm.submittedAt).toLocaleString()}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'processed' | 'rejected')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Notes:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    resize: 'vertical'
                  }}
                  placeholder="Add any notes here..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}