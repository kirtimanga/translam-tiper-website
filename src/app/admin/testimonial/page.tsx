"use client";
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';
import { useState, useEffect } from 'react';
import { useTestimonial, Testimonial, TestimonialProvider } from '@/contexts/TestimonialContext';
import Image from "next/image";

function TestimonialManagement() {
  const { data, updateData, addTestimonial, updateTestimonial, deleteTestimonial } = useTestimonial();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<Omit<Testimonial, 'id'>>({
    name: '',
    image: '',
    text: '',
    stars: 5,
    order: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState('');

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    updateData(formData);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, testimonialForm);
    } else {
      addTestimonial(testimonialForm);
    }

    setShowTestimonialForm(false);
    setEditingTestimonial(null);
    setTestimonialForm({
      name: '',
      image: '',
      text: '',
      stars: 5,
      order: 0,
      isActive: true
    });
    setImagePreview('');
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    // Ensure the image URL is absolute for proper display in form
    const imageUrl = testimonial.image?.startsWith('/uploads/') 
      ? `${BASE_URL}${testimonial.image}`
      : testimonial.image;
    
    setTestimonialForm({
      name: testimonial.name,
      image: imageUrl,
      text: testimonial.text,
      stars: testimonial.stars,
      order: testimonial.order,
      isActive: testimonial.isActive
    });
    setImagePreview(imageUrl);
    setShowTestimonialForm(true);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonial(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setIsUploadingImage(true);
      
      try {
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${BASE_URL}/api/testimonials/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // Convert relative URL to absolute URL for proper display
          const imageUrl = data.url.startsWith('/uploads/') 
            ? `${BASE_URL}${data.url}`
            : data.url;
          setTestimonialForm({ ...testimonialForm, image: imageUrl });
          setImagePreview(imageUrl);
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to upload image');
        }
      } catch (error) {
        alert('Failed to upload image');
        console.error('Upload error:', error);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const removeImage = () => {
    setTestimonialForm({ ...testimonialForm, image: '' });
    setImagePreview('');
  };

  const addDescription = () => {
    if (descriptionInput.trim()) {
      setFormData({
        ...formData,
        descriptions: [...formData.descriptions, descriptionInput.trim()]
      });
      setDescriptionInput('');
    }
  };

  const removeDescription = (index: number) => {
    setFormData({
      ...formData,
      descriptions: formData.descriptions.filter((_, i) => i !== index)
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db' }}>★</span>
    ));
  };

  return (
    <AdminLayout title="Testimonial Management">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        {showSuccess && (
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
            <span>✓</span> Testimonial content updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section Header */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Section Header
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Section Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="e.g., TESTIMONIAL"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
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
                Section Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., What Student Say?"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
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
                Section Descriptions
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDescription())}
                  placeholder="Add a description..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={addDescription}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {formData.descriptions.map((desc, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>{desc}</span>
                    <button
                      type="button"
                      onClick={() => removeDescription(index)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: isSaving ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Testimonials Management */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Manage Testimonials
            </h3>
            <button
              onClick={() => {
                setShowTestimonialForm(true);
                setEditingTestimonial(null);
                setTestimonialForm({
                  name: '',
                  image: '',
                  text: '',
                  stars: 5,
                  order: data.testimonials.length,
                  isActive: true
                });
                setImagePreview('');
              }}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + Add Testimonial
            </button>
          </div>

          {/* Testimonials List */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {testimonial.image ? (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>No Image</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                        {testimonial.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex' }}>
                          {renderStars(testimonial.stars)}
                        </div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          ({testimonial.stars} stars)
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                    {testimonial.text}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span 
                      style={{
                        backgroundColor: testimonial.isActive ? '#10b981' : '#ef4444',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}
                    >
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Order: {testimonial.order}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial Form Modal */}
        {showTestimonialForm && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
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
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '20px' }}>
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              
              <form onSubmit={handleTestimonialSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Person Name
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    placeholder="e.g., Gloria Rose"
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Profile Image
                  </label>
                  
                  {/* Image Preview */}
                  {(imagePreview || testimonialForm.image) && (
                    <div style={{
                      marginBottom: '12px',
                      padding: '12px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Image
                          src={imagePreview || testimonialForm.image}
                          alt="Profile preview"
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0', fontSize: '14px', color: '#374151' }}>
                          Image uploaded successfully
                        </p>
                        <button
                          type="button"
                          onClick={removeImage}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textDecoration: 'underline',
                            padding: '4px 0',
                            marginTop: '4px'
                          }}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: isUploadingImage ? '#f3f4f6' : '#fafafa'
                  }}>
                    {isUploadingImage ? (
                      <div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          Uploading image...
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          id="profile-upload"
                        />
                        <label
                          htmlFor="profile-upload"
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none'
                          }}
                        >
                          {(imagePreview || testimonialForm.image) ? 'Change Image' : 'Upload Image'}
                        </label>
                        <p style={{
                          margin: '8px 0 0 0',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          PNG, JPG, JPEG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Testimonial Text
                  </label>
                  <textarea
                    value={testimonialForm.text}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                    placeholder="Enter the testimonial text..."
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
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
                    Star Rating
                  </label>
                  <select
                    value={testimonialForm.stars}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, stars: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Order
                  </label>
                  <input
                    type="number"
                    value={testimonialForm.order}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, order: parseInt(e.target.value) })}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    <input
                      type="checkbox"
                      checked={testimonialForm.isActive}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestimonialForm(false);
                      setEditingTestimonial(null);
                      setImagePreview('');
                    }}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function TestimonialManagementPage() {
  return (
    <TestimonialProvider>
      <TestimonialManagement />
    </TestimonialProvider>
  );
}