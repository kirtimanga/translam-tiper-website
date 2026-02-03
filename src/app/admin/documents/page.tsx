"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import AdminLayout from '@/components/AdminLayout';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';

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

export default function DocumentsManagement() {
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [documentsData, setDocumentsData] = useState<DocumentsData>({
    heroTitle: '',
    heroBannerImage: '',
    content: '',
    sections: []
  });
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);
  const [newSection, setNewSection] = useState({ sectionName: '', sectionTitle: '', order: 0 });
  const [showAddSection, setShowAddSection] = useState(false);
  const [uploadingToSection, setUploadingToSection] = useState<number | null>(null);
  const [newDocument, setNewDocument] = useState({ documentName: '', description: '', file: null as File | null });

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const fetchDocumentsData = async () => {
    setLoading(true);
    try {
  const response = await fetch(`${BASE_URL}/api/documents/admin`);
      const data = await response.json();
      setDocumentsData(data);
    } catch (error) {
      showAlert('error', 'Failed to fetch documents data');
    } finally {
      setLoading(false);
    }
  };

  const updatePageData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroTitle: documentsData.heroTitle,
          content: documentsData.content
        })
      });
      const result = await response.json();
      if (result.alert) {
        showAlert(result.alert.type, result.alert.message);
      }
    } catch (error) {
      showAlert('error', 'Failed to update page data');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const formData = new FormData();
    formData.append('banner', e.target.files[0]);

    try {
      const response = await fetch(`${BASE_URL}/api/documents/banner`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.bannerImage) {
        setDocumentsData({ ...documentsData, heroBannerImage: result.bannerImage });
        showAlert('success', 'Banner image uploaded successfully');
      }
    } catch (error) {
      showAlert('error', 'Failed to upload banner image');
    }
  };

  const createSection = async () => {
    if (!newSection.sectionName.trim()) {
      showAlert('error', 'Section name is required');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/documents/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection)
      });
      const section = await response.json();
      setDocumentsData({
        ...documentsData,
        sections: [...documentsData.sections, { ...section, documents: [] }]
      });
      setNewSection({ sectionName: '', sectionTitle: '', order: 0 });
      setShowAddSection(false);
      showAlert('success', 'Section created successfully');
    } catch (error) {
      showAlert('error', 'Failed to create section');
    }
  };

  const updateSection = async (sectionId: number, updates: Partial<DocumentSection>) => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedSection = await response.json();
      setDocumentsData({
        ...documentsData,
        sections: documentsData.sections.map(s => 
          s.id === sectionId ? { ...s, ...updatedSection } : s
        )
      });
      setEditingSectionId(null);
      showAlert('success', 'Section updated successfully');
    } catch (error) {
      showAlert('error', 'Failed to update section');
    }
  };

  const deleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section and all its documents?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/documents/sections/${sectionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDocumentsData({
          ...documentsData,
          sections: documentsData.sections.filter(s => s.id !== sectionId)
        });
        showAlert('success', 'Section deleted successfully');
      }
    } catch (error) {
      showAlert('error', 'Failed to delete section');
    }
  };

  const toggleSectionActive = async (sectionId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents/sections/${sectionId}/toggle-active`, {
        method: 'PUT'
      });
      const result = await response.json();
      if (result.success) {
        setDocumentsData({
          ...documentsData,
          sections: documentsData.sections.map(s => 
            s.id === sectionId ? { ...s, isActive: result.section.isActive } : s
          )
        });
        showAlert('success', result.message);
      }
    } catch (error) {
      showAlert('error', 'Failed to toggle section status');
    }
  };

  const uploadDocument = async (sectionId: number) => {
    if (!newDocument.file || !newDocument.documentName.trim()) {
      showAlert('error', 'Document name and file are required');
      return;
    }

    const formData = new FormData();
    formData.append('document', newDocument.file);
    formData.append('documentName', newDocument.documentName);
    formData.append('description', newDocument.description);
    formData.append('sectionId', sectionId.toString());

    try {
      const response = await fetch(`${BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.document) {
        setDocumentsData({
          ...documentsData,
          sections: documentsData.sections.map(s => 
            s.id === sectionId 
              ? { ...s, documents: [...(s.documents || []), result.document] }
              : s
          )
        });
        setUploadingToSection(null);
        setNewDocument({ documentName: '', description: '', file: null });
        showAlert('success', 'Document uploaded successfully');
      }
    } catch (error) {
      showAlert('error', 'Failed to upload document');
    }
  };

  const updateDocument = async (documentId: number, updates: Partial<Document>) => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedDocument = await response.json();
      setDocumentsData({
        ...documentsData,
        sections: documentsData.sections.map(section => ({
          ...section,
          documents: section.documents?.map(doc => 
            doc.id === documentId ? { ...doc, ...updatedDocument } : doc
          ) || []
        }))
      });
      setEditingDocumentId(null);
      showAlert('success', 'Document updated successfully');
    } catch (error) {
      showAlert('error', 'Failed to update document');
    }
  };

  const deleteDocument = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/documents/${documentId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDocumentsData({
          ...documentsData,
          sections: documentsData.sections.map(section => ({
            ...section,
            documents: section.documents?.filter(doc => doc.id !== documentId) || []
          }))
        });
        showAlert('success', 'Document deleted successfully');
      }
    } catch (error) {
      showAlert('error', 'Failed to delete document');
    }
  };

  const toggleDocumentActive = async (documentId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents/${documentId}/toggle-active`, {
        method: 'PUT'
      });
      const result = await response.json();
      if (result.success) {
        setDocumentsData({
          ...documentsData,
          sections: documentsData.sections.map(section => ({
            ...section,
            documents: section.documents?.map(doc => 
              doc.id === documentId ? { ...doc, isActive: result.document.isActive } : doc
            ) || []
          }))
        });
        showAlert('success', result.message);
      }
    } catch (error) {
      showAlert('error', 'Failed to toggle document status');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <AdminLayout title="Documents Management">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Documents Management">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
      
      {/* Page Settings */}
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
          Page Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Hero Title</label>
            <input
              type="text"
              value={documentsData.heroTitle}
              onChange={(e) => setDocumentsData({ ...documentsData, heroTitle: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              style={{ marginBottom: '8px' }}
            />
              {documentsData.heroBannerImage && (
              <img 
                src={`${BASE_URL}${documentsData.heroBannerImage}`} 
                alt="Banner" 
                style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '6px' }}
              />
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Page Content</label>
            <textarea
              value={documentsData.content}
              onChange={(e) => setDocumentsData({ ...documentsData, content: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
          </div>
          
          <button
            onClick={updatePageData}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: 'fit-content'
            }}
          >
            Save Page Settings
          </button>
        </div>
      </div>

      {/* Document Sections */}
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
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Document Sections
          </h3>
          <button
            onClick={() => setShowAddSection(true)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Add New Section
          </button>
        </div>

        {showAddSection && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ marginBottom: '12px', fontWeight: '500' }}>New Section</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <input
                type="text"
                placeholder="Section Name (required)"
                value={newSection.sectionName}
                onChange={(e) => setNewSection({ ...newSection, sectionName: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <input
                type="text"
                placeholder="Section Title (optional)"
                value={newSection.sectionTitle}
                onChange={(e) => setNewSection({ ...newSection, sectionTitle: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <input
                type="number"
                placeholder="Order"
                value={newSection.order}
                onChange={(e) => setNewSection({ ...newSection, order: parseInt(e.target.value) || 0 })}
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={createSection}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Create Section
                </button>
                <button
                  onClick={() => {
                    setShowAddSection(false);
                    setNewSection({ sectionName: '', sectionTitle: '', order: 0 });
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {documentsData.sections.map((section) => (
          <div
            key={section.id}
            style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #e5e7eb',
              opacity: section.isActive ? 1 : 0.7
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              {editingSectionId === section.id ? (
                <div style={{ flex: 1, marginRight: '12px' }}>
                  <input
                    type="text"
                    value={section.sectionName}
                    onChange={(e) => setDocumentsData({
                      ...documentsData,
                      sections: documentsData.sections.map(s => 
                        s.id === section.id ? { ...s, sectionName: e.target.value } : s
                      )
                    })}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                  />
                  <input
                    type="text"
                    value={section.sectionTitle}
                    onChange={(e) => setDocumentsData({
                      ...documentsData,
                      sections: documentsData.sections.map(s => 
                        s.id === section.id ? { ...s, sectionTitle: e.target.value } : s
                      )
                    })}
                    placeholder="Section Title"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                    {section.sectionName}
                  </h4>
                  {section.sectionTitle && (
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{section.sectionTitle}</p>
                  )}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {editingSectionId === section.id ? (
                  <>
                    <button
                      onClick={() => updateSection(section.id, section)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingSectionId(null);
                        fetchDocumentsData();
                      }}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingSectionId(section.id)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleSectionActive(section.id)}
                      style={{
                        backgroundColor: section.isActive ? '#f59e0b' : '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {section.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setUploadingToSection(section.id)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Add Document
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {uploadingToSection === section.id && (
              <div style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h5 style={{ marginBottom: '8px', fontWeight: '500' }}>Upload Document</h5>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Document Name (required)"
                    value={newDocument.documentName}
                    onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
                    style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px'
                    }}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    rows={2}
                    style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    type="file"
                    onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files?.[0] || null })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => uploadDocument(section.id)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => {
                        setUploadingToSection(null);
                        setNewDocument({ documentName: '', description: '', file: null });
                      }}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Documents in this section */}
            {section.documents && section.documents.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {section.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '1px solid #e5e7eb',
                      opacity: doc.isActive ? 1 : 0.6
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {editingDocumentId === doc.id ? (
                        <div style={{ flex: 1, marginRight: '12px' }}>
                          <input
                            type="text"
                            value={doc.documentName}
                            onChange={(e) => setDocumentsData({
                              ...documentsData,
                              sections: documentsData.sections.map(s => ({
                                ...s,
                                documents: s.documents?.map(d => 
                                  d.id === doc.id ? { ...d, documentName: e.target.value } : d
                                ) || []
                              }))
                            })}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}
                          />
                          <textarea
                            value={doc.description}
                            onChange={(e) => setDocumentsData({
                              ...documentsData,
                              sections: documentsData.sections.map(s => ({
                                ...s,
                                documents: s.documents?.map(d => 
                                  d.id === doc.id ? { ...d, description: e.target.value } : d
                                ) || []
                              }))
                            })}
                            placeholder="Description"
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {doc.documentName}
                          </h5>
                          {doc.description && (
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                              {doc.description}
                            </p>
                          )}
                          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {doc.fileName} ({formatFileSize(doc.fileSize)})
                          </p>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {editingDocumentId === doc.id ? (
                          <>
                            <button
                              onClick={() => updateDocument(doc.id, doc)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '4px 8px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingDocumentId(null);
                                fetchDocumentsData();
                              }}
                              style={{
                                backgroundColor: '#6b7280',
                                color: 'white',
                                padding: '4px 8px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <a
                              href={`${BASE_URL}${doc.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '4px 8px',
                                border: 'none',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontSize: '12px'
                              }}
                            >
                              View
                            </a>
                            <button
                              onClick={() => setEditingDocumentId(doc.id)}
                              style={{
                                backgroundColor: '#6b7280',
                                color: 'white',
                                padding: '4px 8px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleDocumentActive(doc.id)}
                              style={{
                                backgroundColor: doc.isActive ? '#f59e0b' : '#10b981',
                                color: 'white',
                                padding: '4px 8px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              {doc.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '4px 8px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {documentsData.sections.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <p>No document sections yet. Click "Add New Section" to get started.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}