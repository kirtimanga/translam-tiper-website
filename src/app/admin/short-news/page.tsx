"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';

interface ShortNews {
  id: number;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ShortNewsPage() {
  const [shortNewsList, setShortNewsList] = useState<ShortNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchShortNews();
  }, []);

  const fetchShortNews = async () => {
    try {
  const response = await fetch(`${BASE_URL}/api/short-news`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched short news:', data);
        setShortNewsList(data.shortNews || []);
      } else {
        console.error('Failed to fetch:', response.status, response.statusText);
        setError(`Failed to fetch short news: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch short news: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingId 
        ? `${BASE_URL}/api/short-news/${editingId}` 
        : `${BASE_URL}/api/short-news`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      console.log('Submitting:', method, url, formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('Response:', response.status, responseData);

      if (response.ok) {
        setSuccess(editingId ? 'News updated successfully!' : 'News added successfully!');
        resetForm();
        fetchShortNews();
      } else {
        setError(`Failed to save: ${responseData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to save news: ' + (error as Error).message);
    }
  };

  const handleEdit = (news: ShortNews) => {
    setEditingId(news.id);
    setFormData({
      title: news.title,
      is_active: news.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
  const response = await fetch(`${BASE_URL}/api/short-news/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('News deleted successfully!');
        fetchShortNews();
      } else {
        let errBody: any = null;
        try { errBody = await response.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || 'Failed to delete';
        throw new Error(msg);
      }
    } catch (error) {
      setError('Failed to delete news');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', is_active: true });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <AdminLayout title="Short News Management">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Short News (Header Ticker)
          </h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Add New News
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              {editingId ? 'Edit News' : 'Add New News'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px',
                color: '#374151'
              }}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>


            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                Active (Show in header)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {editingId ? 'Update' : 'Add'} News
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* News List */}
        {isLoading ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>Loading...</p>
        ) : shortNewsList.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>
            No short news added yet. Click "Add New News" to get started.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Title
                  </th>
                  <th style={{
                    textAlign: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Status
                  </th>
                  <th style={{
                    textAlign: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortNewsList.map((news) => (
                  <tr key={news.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{
                      padding: '12px',
                      fontSize: '14px',
                      color: '#1f2937'
                    }}>
                      {news.title}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: news.is_active ? '#d1fae5' : '#fee2e2',
                        color: news.is_active ? '#065f46' : '#991b1b'
                      }}>
                        {news.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(news)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(news.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}