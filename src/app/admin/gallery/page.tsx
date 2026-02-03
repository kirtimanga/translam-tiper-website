"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';

interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

interface GallerySection {
  id: string;
  sectionName: string;
  sectionTitle?: string;
  images: GalleryImage[];
}

interface GalleryData {
  heroImage?: string;
  heroTitle?: string;
  sections: GallerySection[];
}

export default function GalleryManagement() {
  const { alert, showAlert, hideAlert } = useAlert();
  const [galleryData, setGalleryData] = useState<GalleryData>({
    heroImage: '',
    heroTitle: '',
    sections: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>('');
  
  // Modal states
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string>('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  
  // Image upload states
  const [uploadingSectionId, setUploadingSectionId] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/gallery/admin`);
      if (response.ok) {
        const data = await response.json();
        setGalleryData(data);
        setHeroPreview(data.heroImage ? `${BASE_URL}${data.heroImage}` : '');
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      showAlert('error', 'Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadHeroImage = async () => {
    if (!heroFile) return;

    const formData = new FormData();
    formData.append('heroImage', heroFile);

    try {
      const response = await fetch(`${BASE_URL}/api/gallery/hero`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setGalleryData(prev => ({ ...prev, heroImage: data.heroImage }));
        setHeroFile(null);
        showAlert('success', 'Hero image uploaded successfully!');
        fetchGalleryData();
      }
    } catch (error) {
      console.error('Error uploading hero image:', error);
      showAlert('error', 'Failed to upload hero image');
    }
  };

  const saveHeroTitle = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${BASE_URL}/api/gallery/hero-title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ heroTitle: galleryData.heroTitle }),
      });

      if (response.ok) {
        showAlert('success', 'Hero title updated successfully!');
      } else {
        showAlert('error', 'Failed to update hero title');
      }
    } catch (error) {
      console.error('Error updating hero title:', error);
      showAlert('error', 'An error occurred while updating hero title');
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    if (!newSectionName.trim()) {
      showAlert('error', 'Section name is required');
      return;
    }

    try {
      const requestData = {
        sectionName: newSectionName,
        sectionTitle: newSectionTitle || undefined,
      };

      const response = await fetch(`${BASE_URL}/api/gallery/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setNewSectionName('');
        setNewSectionTitle('');
        setShowAddSectionModal(false);
        showAlert('success', 'Section added successfully!');
        fetchGalleryData();
      } else {
        showAlert('error', responseData.error || 'Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      if (error instanceof Error) {
        showAlert('error', 'Failed to add section: ' + error.message);
      } else {
        showAlert('error', 'Failed to add section');
      }
    }
  };

  const editSection = async () => {
    if (!newSectionName.trim()) {
      showAlert('error', 'Section name is required');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/gallery/sections/${editingSectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionName: newSectionName,
          sectionTitle: newSectionTitle || undefined,
        }),
      });

      if (response.ok) {
        setGalleryData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === editingSectionId
              ? { ...section, sectionName: newSectionName, sectionTitle: newSectionTitle || undefined }
              : section
          )
        }));
        setNewSectionName('');
        setNewSectionTitle('');
        setEditingSectionId('');
        setShowEditSectionModal(false);
        showAlert('success', 'Section updated successfully!');
        fetchGalleryData();
      }
    } catch (error) {
      console.error('Error updating section:', error);
      showAlert('error', 'Failed to update section');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its images?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/gallery/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGalleryData(prev => ({
          ...prev,
          sections: prev.sections.filter(section => section.id !== sectionId)
        }));
        showAlert('success', 'Section deleted successfully!');
        fetchGalleryData();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      showAlert('error', 'Failed to delete section');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(e.target.files);
      const previews: string[] = [];
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === e.target.files!.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const uploadImages = async () => {
    if (!imageFiles || imageFiles.length === 0) {
      showAlert('error', 'Please select images to upload');
      return;
    }

    const formData = new FormData();
    Array.from(imageFiles).forEach(file => {
      formData.append('images', file);
    });
    formData.append('sectionId', uploadingSectionId);
    formData.append('title', imageTitle);
    formData.append('description', imageDescription);

    try {
      const response = await fetch(`${BASE_URL}/api/gallery/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setGalleryData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === uploadingSectionId
              ? { ...section, images: [...section.images, ...data.images] }
              : section
          )
        }));
        
        // Reset form
        setImageFiles(null);
        setImagePreviews([]);
        setImageTitle('');
        setImageDescription('');
        setUploadingSectionId('');
        setShowImageModal(false);
        
        showAlert('success', 'Images uploaded successfully!');
        fetchGalleryData();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showAlert('error', 'Failed to upload images');
    }
  };

  const deleteImage = async (sectionId: string, imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/gallery/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGalleryData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? { ...section, images: section.images.filter(img => img.id !== imageId) }
              : section
          )
        }));
        showAlert('success', 'Image deleted successfully!');
        fetchGalleryData();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showAlert('error', 'Failed to delete image');
    }
  };

  const toggleImageActive = async (sectionId: string, imageId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/gallery/images/${imageId}/toggle-active`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        setGalleryData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? { 
                  ...section, 
                  images: section.images.map(img => 
                    img.id === imageId 
                      ? { ...img, isActive: data.image.isActive }
                      : img
                  ) 
                }
              : section
          )
        }));
        showAlert('success', data.message || 'Image status updated successfully!');
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      showAlert('error', 'Failed to update image status');
    }
  };

  const openEditSectionModal = (section: GallerySection) => {
    setEditingSectionId(section.id);
    setNewSectionName(section.sectionName);
    setNewSectionTitle(section.sectionTitle || '');
    setShowEditSectionModal(true);
  };

  const openImageUploadModal = (sectionId: string) => {
    setUploadingSectionId(sectionId);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Gallery Management">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gallery Management">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}

      {/* Hero Section */}
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
          Hero Section
        </h3>
        
        {/* Hero Image */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
            Hero Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleHeroImageChange}
            style={{
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              width: '100%',
              marginBottom: '12px'
            }}
          />
          
          {heroPreview && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                height: '200px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <Image
                  src={heroPreview}
                  alt="Hero preview"
                  fill
                  sizes="(max-width: 600px) 100vw, 600px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
          
          {heroFile && (
            <button
              type="button"
              onClick={uploadHeroImage}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Upload Hero Image
            </button>
          )}
        </div>

        {/* Hero Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
            Hero Title
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={galleryData.heroTitle || ''}
              onChange={(e) => setGalleryData(prev => ({ ...prev, heroTitle: e.target.value }))}
              placeholder="Enter hero title..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={saveHeroTitle}
              disabled={saving}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {saving ? 'Saving...' : 'Save Title'}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Sections */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Gallery Sections
          </h3>
          <button
            onClick={() => setShowAddSectionModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Add Section
          </button>
        </div>

        {galleryData.sections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            border: '2px dashed #d1d5db',
            borderRadius: '8px'
          }}>
            No sections yet. Click "Add Section" to create your first gallery section.
          </div>
        ) : (
          galleryData.sections.map((section) => (
            <div key={section.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {section.sectionName}
                  </h4>
                  {section.sectionTitle && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0'
                    }}>
                      {section.sectionTitle}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openImageUploadModal(section.id)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Add Images
                  </button>
                  <button
                    onClick={() => openEditSectionModal(section)}
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
                    onClick={() => deleteSection(section.id)}
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

              {/* Images Grid */}
              {section.images.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#6b7280',
                  border: '1px dashed #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  No images in this section yet.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {section.images.map((image) => (
                    <div key={image.id} style={{
                      position: 'relative',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      opacity: image.isActive === false ? 0.5 : 1
                    }}>
                      {/* Active/Inactive Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: image.isActive === false ? '#ef4444' : '#10b981',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        zIndex: 2
                      }}>
                        {image.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                      </div>

                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '150px'
                      }}>
                        <Image
                          src={`${BASE_URL}${image.url}`}
                          alt={image.title || 'Gallery image'}
                          fill
                          sizes="200px"
                          style={{ objectFit: 'cover' }}
                        />
                        <button
                          onClick={() => deleteImage(section.id, image.id)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            zIndex: 2
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ 
                        padding: '8px',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <button
                          onClick={() => toggleImageActive(section.id, image.id)}
                          style={{
                            backgroundColor: image.isActive === false ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            width: '100%',
                            marginBottom: '8px'
                          }}
                        >
                          {image.isActive === false ? 'Activate' : 'Deactivate'}
                        </button>
                      </div>

                      {(image.title || image.description) && (
                        <div style={{ padding: '0 8px 8px 8px' }}>
                          {image.title && (
                            <h5 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              margin: '0 0 4px 0',
                              color: '#1f2937'
                            }}>
                              {image.title}
                            </h5>
                          )}
                          {image.description && (
                            <p style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              margin: '0'
                            }}>
                              {image.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Section Modal */}
      {showAddSectionModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Add New Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Section Name *
              </label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter section name..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Section Title (Optional)
              </label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter section title..."
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddSectionModal(false);
                  setNewSectionName('');
                  setNewSectionTitle('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addSection}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {showEditSectionModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Edit Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Section Name *
              </label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter section name..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Section Title (Optional)
              </label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter section title..."
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowEditSectionModal(false);
                  setNewSectionName('');
                  setNewSectionTitle('');
                  setEditingSectionId('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editSection}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Update Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Upload Images
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Select Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Image Title (Optional)
              </label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter image title..."
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Image Description (Optional)
              </label>
              <textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter image description..."
              />
            </div>

            {imagePreviews.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Preview ({imagePreviews.length} images):
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        sizes="100px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageFiles(null);
                  setImagePreviews([]);
                  setImageTitle('');
                  setImageDescription('');
                  setUploadingSectionId('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadImages}
                disabled={!imageFiles || imageFiles.length === 0}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: imageFiles && imageFiles.length > 0 ? '#10b981' : '#9ca3af',
                  color: 'white',
                  cursor: imageFiles && imageFiles.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Upload Images
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}