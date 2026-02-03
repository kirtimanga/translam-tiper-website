"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Events.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';

interface EventImage {
  id?: string;
  url: string;
  title: string;
  description: string;
}

interface EventSection {
  id: string;
  sectionName: string;
  sectionTitle?: string;
  images: EventImage[];
}

interface EventsData {
  slug: string;
  title: string;
  content: string;
  bannerImage: string;
  sections: EventSection[];
}

function Events() {
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/events');
      if (response.ok) {
        const data = await response.json();
        // Transform old gallery data to new sections format if needed
        if (data.gallery && !data.sections) {
          data.sections = [];
        }
        setEventsData(data);
      }
    } catch (error) {
      console.error('Error fetching events data:', error);
      // Check if it's a JSON parsing error (API returning HTML)
      if (error.message && error.message.includes('Unexpected token')) {
        console.error('API is returning HTML instead of JSON. Backend may not be running on port 4000.');
      }
      // Initialize with empty sections for development
      setEventsData({
        slug: 'events',
        title: 'Events',
        content: '<p>Manage your event sections with images and descriptions.</p>',
        bannerImage: '/images/commonBanner.png',
        sections: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    
    const newSection: EventSection = {
      id: Date.now().toString(),
      sectionName: newSectionName,
      sectionTitle: newSectionTitle || undefined,
      images: []
    };
    
    setEventsData(prev => prev ? {
      ...prev,
      sections: [...prev.sections, newSection]
    } : null);
    
    setNewSectionName('');
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    setEventsData(prev => prev ? {
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    } : null);
  };

  const handleEditSection = (sectionId: string, name: string, title?: string) => {
    setEventsData(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, sectionName: name, sectionTitle: title }
          : section
      )
    } : null);
    setEditingSectionId(null);
  };

  const handleAddImage = (sectionId: string, imageFile: File) => {
    // In a real implementation, you would upload the file to your server
    const newImage: EventImage = {
      id: Date.now().toString(),
      url: URL.createObjectURL(imageFile),
      title: '',
      description: ''
    };
    
    setEventsData(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, images: [...section.images, newImage] }
          : section
      )
    } : null);
  };

  const handleDeleteImage = (sectionId: string, imageId: string) => {
    setEventsData(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, images: section.images.filter(img => img.id !== imageId) }
          : section
      )
    } : null);
  };

  const handleEditImage = (sectionId: string, imageId: string, title: string, description: string) => {
    setEventsData(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              images: section.images.map(img => 
                img.id === imageId ? { ...img, title, description } : img
              ) 
            }
          : section
      )
    } : null);
    setEditingImageId(null);
  };

  const handleViewGallery = () => {
    window.open('http://localhost:3000/events-gallery', '_blank');
  };

  if (loading) {
    return (
      <>
        <CommonBanner 
          title="Events" 
          imgSrc="/images/commonBanner.png" 
        />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </>
    );
  }
    
  return (
    <>
      <CommonBanner 
        title="Events" 
        imgSrc={eventsData?.bannerImage ? `http://localhost:4000${eventsData.bannerImage}` : "/images/commonBanner.png"} 
      />
      <section className={styles.eventswrapper}>
        <div className='container'>
          <div className={styles.eventContent}>
            <h2>Dynamic Sections</h2>
            <div 
              dangerouslySetInnerHTML={{ 
                __html: eventsData?.content || '<p>Manage your event sections with images and descriptions.</p>' 
              }} 
            />
            <button 
              className={styles.viewGalleryBtn}
              onClick={handleViewGallery}
            >
              View Full Gallery
            </button>
          </div>

          {/* Add New Section Button */}
          <div className={styles.addSectionContainer}>
            {!isAddingSection ? (
              <button 
                className={styles.addBtn}
                onClick={() => setIsAddingSection(true)}
              >
                + Add New Section
              </button>
            ) : (
              <div className={styles.addSectionForm}>
                <input
                  type="text"
                  placeholder="Section Name*"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Section Title (optional)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.formButtons}>
                  <button onClick={handleAddSection} className={styles.saveBtn}>
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsAddingSection(false);
                      setNewSectionName('');
                      setNewSectionTitle('');
                    }} 
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Sections */}
          {eventsData?.sections && eventsData.sections.length > 0 ? (
            <div className={styles.sectionsContainer}>
              {eventsData.sections.map((section) => (
                <div key={section.id} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    {editingSectionId === section.id ? (
                      <div className={styles.editSectionForm}>
                        <input
                          type="text"
                          defaultValue={section.sectionName}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              const titleInput = target.nextElementSibling as HTMLInputElement;
                              handleEditSection(section.id, target.value, titleInput.value || undefined);
                            }
                          }}
                          className={styles.input}
                        />
                        <input
                          type="text"
                          defaultValue={section.sectionTitle || ''}
                          placeholder="Section Title (optional)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              const nameInput = target.previousElementSibling as HTMLInputElement;
                              handleEditSection(section.id, nameInput.value, target.value || undefined);
                            }
                          }}
                          className={styles.input}
                        />
                        <button 
                          onClick={() => {
                            const nameInput = document.querySelector(`input[defaultValue="${section.sectionName}"]`) as HTMLInputElement;
                            const titleInput = nameInput?.nextElementSibling as HTMLInputElement;
                            handleEditSection(section.id, nameInput?.value || section.sectionName, titleInput?.value || undefined);
                          }}
                          className={styles.saveBtn}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingSectionId(null)}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.sectionInfo}>
                          <h3>{section.sectionName}</h3>
                          {section.sectionTitle && <h4>{section.sectionTitle}</h4>}
                        </div>
                        <div className={styles.sectionActions}>
                          <button 
                            onClick={() => setEditingSectionId(section.id)}
                            className={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteSection(section.id)}
                            className={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Images in this section */}
                  <div className={styles.imagesContainer}>
                    <div className={styles.addImageContainer}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAddImage(section.id, file);
                            e.target.value = '';
                          }
                        }}
                        className={styles.fileInput}
                        id={`file-${section.id}`}
                      />
                      <label htmlFor={`file-${section.id}`} className={styles.addImageBtn}>
                        + Add Image
                      </label>
                    </div>

                    {section.images.length > 0 && (
                      <div className={styles.imageGrid}>
                        {section.images.map((image) => (
                          <div key={image.id} className={styles.imageItem}>
                            <div className={styles.imageContainer}>
                              <Image 
                                src={image.url} 
                                alt={image.title || 'Section image'} 
                                width={200}
                                height={150}
                                style={{ objectFit: 'cover' }}
                              />
                              <div className={styles.imageOverlay}>
                                <button 
                                  onClick={() => setEditingImageId(image.id || '')}
                                  className={styles.editImageBtn}
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteImage(section.id, image.id || '')}
                                  className={styles.deleteImageBtn}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            
                            {editingImageId === image.id ? (
                              <div className={styles.imageEditForm}>
                                <input
                                  type="text"
                                  defaultValue={image.title}
                                  placeholder="Image title"
                                  className={styles.input}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      const descInput = target.nextElementSibling as HTMLInputElement;
                                      handleEditImage(section.id, image.id || '', target.value, descInput.value);
                                    }
                                  }}
                                />
                                <input
                                  type="text"
                                  defaultValue={image.description}
                                  placeholder="Image description"
                                  className={styles.input}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      const titleInput = target.previousElementSibling as HTMLInputElement;
                                      handleEditImage(section.id, image.id || '', titleInput.value, target.value);
                                    }
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    const titleInput = document.querySelector(`input[defaultValue="${image.title}"]`) as HTMLInputElement;
                                    const descInput = titleInput?.nextElementSibling as HTMLInputElement;
                                    handleEditImage(section.id, image.id || '', titleInput?.value || '', descInput?.value || '');
                                  }}
                                  className={styles.saveBtn}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingImageId(null)}
                                  className={styles.cancelBtn}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className={styles.imageInfo}>
                                <h5>{image.title || 'Untitled'}</h5>
                                <p>{image.description || 'No description'}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              No sections created yet. Click "Add New Section" to get started.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Events;