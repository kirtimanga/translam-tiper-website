"use client";
import React, { Suspense, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';
import apiFetch from '@/utils/apiFetch';
import { useSlider, SliderProvider } from '@/contexts/SliderContext';

function HomeSliderManagement() {
  const { sliders, addSlider, updateSlider, deleteSlider } = useSlider();
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    order: 0,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Convert absolute URLs back to relative paths for storage
      const dataToSave = {
        ...formData,
        image: formData.image.startsWith(BASE_URL) 
          ? formData.image.replace(BASE_URL, '')
          : formData.image
      };

      if (editingSlider) {
        // Update existing slider
        await updateSlider(editingSlider.id, dataToSave);
        setSuccessMessage('Slider updated successfully!');
      } else {
        // Add new slider
        await addSlider(dataToSave);
        setSuccessMessage('Slider added successfully!');
      }
      
      // Reset form
      setShowForm(false);
      setEditingSlider(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        order: 0,
        isActive: true
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slider: any) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      // Convert relative paths to absolute URLs for proper display in form
      image: slider.image.startsWith('/uploads/') 
        ? `${BASE_URL}${slider.image}`
        : slider.image,
      order: slider.order,
      isActive: slider.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this slider?')) {
      try {
        await deleteSlider(id);
        setSuccessMessage('Slider deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to delete slider');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }

      try {
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await apiFetch('/api/home-sliders/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // Convert relative URL to absolute URL for proper display
          const imageUrl = data.url.startsWith('/uploads/') 
            ? `${BASE_URL}${data.url}`
            : data.url;
          setFormData(prev => ({ ...prev, image: imageUrl }));
          setErrorMessage('');
        } else {
          // Try to parse JSON error, fallback to text
          let serverMsg = `Failed to upload image (status ${response.status})`;
          try {
            const errBody = await response.json();
            serverMsg = errBody?.error || errBody?.message || serverMsg;
          } catch (_e) {
            try {
              const text = await response.text();
              if (text) serverMsg = `${serverMsg}: ${text}`;
            } catch (_e2) {
              /* ignore */
            }
          }
          setErrorMessage(serverMsg);
        }
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
        setErrorMessage(`Failed to upload image: ${msg}`);
        // eslint-disable-next-line no-console
        console.debug('Upload error:', uploadErr);
      }
    }
  };

  return (
    <AdminLayout title="Home Slider Management">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        {/* Success Message */}
        {successMessage && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠</span> {errorMessage}
          </div>
        )}

        {/* Header with Add Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Manage Home Sliders
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showForm ? 'Cancel' : '+ Add New Slider'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              {editingSlider ? 'Edit Slider' : 'Add New Slider'}
            </h4>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., TRANSLAM Group of Institutions"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Subtitle *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., Shaping Futures with Excellence in Education Since 1987"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Upload Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  required={!editingSlider}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{
                      marginTop: '8px',
                      maxWidth: '200px',
                      maxHeight: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
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
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Active
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {isSubmitting ? 'Saving...' : (editingSlider ? 'Update Slider' : 'Add Slider')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSlider(null);
                    setFormData({
                      title: '',
                      subtitle: '',
                      image: '',
                      order: 0,
                      isActive: true
                    });
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
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
          </div>
        )}

        {/* Sliders List */}
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Current Sliders
          </h4>
          
          {sliders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              No sliders added yet. Click "Add New Slider" to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sliders.sort((a, b) => a.order - b.order).map((slider) => (
                <div
                  key={slider.id}
                  style={{
                    backgroundColor: '#f9fafb',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <img
                    src={slider.image.startsWith('/uploads/') 
                      ? `${BASE_URL}${slider.image}`
                      : slider.image}
                    alt={slider.title}
                    style={{
                      width: '100px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h5 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      {slider.title}
                    </h5>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {slider.subtitle}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      <span>Order: {slider.order}</span>
                      <span>Status: {slider.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(slider)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function HomeSliderManagementPage() {
  return (
    <Suspense fallback={<div />}> 
      <SliderProvider>
        <HomeSliderManagement />
      </SliderProvider>
    </Suspense>
  );
}