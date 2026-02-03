'use client';
import React, { useState, useEffect } from 'react';
import CommonBanner from '../CommonSection/CommonBanner';
import { BASE_URL } from '../../utils/baseUrl';
import apiFetch from '@/utils/apiFetch';
import styles from "./Document.module.scss";

interface Document {
  id: number;
  documentName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description: string;
  uploadedAt: string;
  isActive: boolean;
  order: number;
}

interface DocumentSection {
  id: number;
  sectionName: string;
  sectionTitle: string;
  order: number;
  isActive: boolean;
  documents: Document[];
}

interface DocumentsData {
  heroTitle: string;
  heroBannerImage: string;
  content: string;
  sections: DocumentSection[];
}

function Document() {
  const [documentsData, setDocumentsData] = useState<DocumentsData>({
    heroTitle: 'Documents',
    heroBannerImage: '/images/commonBanner.png',
    content: '',
    sections: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await apiFetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocumentsData(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching documents:', error.message);
      } else {
        console.error('Error fetching documents:', String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (fileUrl: string, documentName: string) => {
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <CommonBanner 
        title={documentsData.heroTitle || "Documents"} 
  imgSrc={documentsData.heroBannerImage ? `${BASE_URL}${documentsData.heroBannerImage}` : "/images/commonBanner.png"} 
      />
      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
        ) : (
          <>
            {documentsData.content && (
              <div className={styles.documents_intro}>
                <p>{documentsData.content}</p>
              </div>
            )}
            
            {documentsData.sections.length > 0 ? (
              documentsData.sections
                .filter(section => section.isActive && section.documents.length > 0)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className={styles.documents_section}>
                    <h2>{section.sectionName}</h2>
                    {section.sectionTitle && (
                      <p className={styles.section_title}>{section.sectionTitle}</p>
                    )}
                    <div className={styles.documents_list}>
                      {section.documents
                        .filter(doc => doc.isActive)
                        .sort((a, b) => a.order - b.order)
                        .map((doc) => (
                          <div key={doc.id} className={styles.doc_card}>
                            <a 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDocumentClick(doc.fileUrl, doc.documentName);
                              }}
                            >
                              <span className={styles.doc_name}>{doc.documentName}</span>
                              {doc.description && (
                                <span className={styles.doc_description}>{doc.description}</span>
                              )}
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className={styles.no_documents}>
                <p>No documents available at the moment.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Document;