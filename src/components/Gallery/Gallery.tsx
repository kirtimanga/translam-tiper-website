"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/baseUrl';
import apiFetch from '@/utils/apiFetch';
import Image from 'next/image';
import styles from './Galery.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';

interface GalleryImage {
  id?: string;
  url: string;
  title: string;
  description: string;
}

interface GallerySection {
  id: string;
  sectionName: string;
  sectionTitle?: string;
  images: GalleryImage[];
}

interface GalleryData {
  slug: string;
  title: string;
  content: string;
  bannerImage: string;
  sections: GallerySection[];
}

function Gallery() {
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState<{ sectionIndex: number; imageIndex: number } | null>(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const response = await apiFetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setGalleryData(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching gallery data:', error.message);
      } else {
        console.error('Error fetching gallery data:', String(error));
      }
      setGalleryData({
        slug: 'gallery',
        title: 'Gallery',
        content: '<p>Explore our gallery.</p>',
        bannerImage: '/images/commonBanner.png',
        sections: []
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (sectionIndex: number, imageIndex: number) => {
    setModalIndex({ sectionIndex, imageIndex });
  };

  const closeModal = () => setModalIndex(null);

  const next = () => {
    if (modalIndex && galleryData?.sections) {
      const currentSection = galleryData.sections[modalIndex.sectionIndex];
      const nextImageIndex = modalIndex.imageIndex + 1;
      
      if (nextImageIndex < currentSection.images.length) {
        // Next image in same section
        setModalIndex({ sectionIndex: modalIndex.sectionIndex, imageIndex: nextImageIndex });
      } else {
        // Move to first image of next section
        const nextSectionIndex = modalIndex.sectionIndex + 1;
        if (nextSectionIndex < galleryData.sections.length && galleryData.sections[nextSectionIndex].images.length > 0) {
          setModalIndex({ sectionIndex: nextSectionIndex, imageIndex: 0 });
        }
      }
    }
  };

  const prev = () => {
    if (modalIndex && galleryData?.sections) {
      const prevImageIndex = modalIndex.imageIndex - 1;
      
      if (prevImageIndex >= 0) {
        // Previous image in same section
        setModalIndex({ sectionIndex: modalIndex.sectionIndex, imageIndex: prevImageIndex });
      } else {
        // Move to last image of previous section
        const prevSectionIndex = modalIndex.sectionIndex - 1;
        if (prevSectionIndex >= 0 && galleryData.sections[prevSectionIndex].images.length > 0) {
          const lastImageIndex = galleryData.sections[prevSectionIndex].images.length - 1;
          setModalIndex({ sectionIndex: prevSectionIndex, imageIndex: lastImageIndex });
        }
      }
    }
  };

  if (loading) {
    return (
      <>
        <CommonBanner 
          title="Gallery" 
          imgSrc="/images/commonBanner.png" 
        />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </>
    );
  }
    
  return (
    <>
      <CommonBanner 
        title="Gallery" 
  imgSrc={galleryData?.bannerImage ? `${BASE_URL}${galleryData.bannerImage}` : "/images/commonBanner.png"} 
      />
      <section className={`${styles.eventswrapper} ${styles.publicGallery}`}>
        <div className='container'>
          <div className={styles.eventContent}>
            <h2>Gallery</h2>
            {/* <div 
              dangerouslySetInnerHTML={{ 
                __html: galleryData?.content || '<p>Explore our latest events and activities through our gallery.</p>' 
              }} 
            /> */}
          </div>

          {galleryData?.sections && galleryData.sections.length > 0 ? (
            <div className={styles.sectionsContainer}>
              {galleryData.sections.map((section, sectionIndex) => (
                <div key={section.id} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionInfo}>
                      <h3>{section.sectionName}</h3>
                      {section.sectionTitle && <h4>{section.sectionTitle}</h4>}
                    </div>
                  </div>

                  {section.images && section.images.length > 0 && (
                    <div className={styles.imagesContainer}>
                      <div className={styles.imageGrid}>
                        {section.images.map((image, imageIndex) => (
                          <div key={image.id} className={styles.imageItem}>
                            <div 
                              className={styles.imageContainer}
                              onClick={() => openModal(sectionIndex, imageIndex)}
                              style={{ cursor: 'pointer', position: 'relative' }}
                            >
                              <Image 
                                src={`${BASE_URL}${image.url}`} 
                                alt={image.title || 'Gallery image'} 
                                width={250}
                                height={200}
                                style={{ objectFit: 'cover' }}
                              />
                              {image.title && (
                                <div className={styles.imageTitleOverlay}>
                                  <div className={styles.imageTitle}>
                                    {image.title}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {image.description && (
                              <div className={styles.imageDescription}>
                                <p>{image.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              No gallery sections available yet.
            </div>
          )}

          {/* Modal for image viewing */}
          {modalIndex !== null && galleryData?.sections && (
            <div className={styles.modal} onClick={closeModal}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className={styles.closeBtn}>×</button>
                <button onClick={prev} className={styles.navBtn}>←</button>
                <div className={styles.viewer}>
                  <Image 
                    src={`${BASE_URL}${galleryData.sections[modalIndex.sectionIndex].images[modalIndex.imageIndex].url}`} 
                    alt={galleryData.sections[modalIndex.sectionIndex].images[modalIndex.imageIndex].title || 'Gallery image'} 
                    width={800}
                    height={600}
                    sizes="(max-width: 1024px) 100vw, 800px"
                    style={{ objectFit: 'contain' }}
                  />
                  <div style={{ color: 'white', marginTop: '0.5rem', textAlign: 'center' }}>
                    <h4>{galleryData.sections[modalIndex.sectionIndex].images[modalIndex.imageIndex].title || 'Untitled'}</h4>
                    {galleryData.sections[modalIndex.sectionIndex].images[modalIndex.imageIndex].description && (
                      <p>{galleryData.sections[modalIndex.sectionIndex].images[modalIndex.imageIndex].description}</p>
                    )}
                  </div>
                </div>
                <button onClick={next} className={styles.navBtn}>→</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Gallery;