"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { CharacterCount } from '@tiptap/extension-character-count';
import './tiptap.css';

interface EventsImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

interface EventsSection {
  id: string;
  sectionName: string;
  sectionTitle?: string;
  images: EventsImage[];
}

interface EventsData {
  slug: string;
  title: string;
  content: string;
  bannerImage: string;
  sections: EventsSection[];
}

export default function EventsManagement() {
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [showSource, setShowSource] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  
  // Modal states for sections
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      CodeBlock,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      CharacterCount,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    fetchEventsData();
  }, []);

  // Set editor content when editor is ready
  useEffect(() => {
    if (editor) {
      fetchEventsData();
    }
  }, [editor]);

  const fetchEventsData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEventsData(data);
        setBannerPreview(data.bannerImage ? `${BASE_URL}${data.bannerImage}` : '');
        if (data.content && editor) {
          editor.commands.setContent(data.content);
          setHtmlContent(data.content);
        }
      }
    } catch (error) {
      console.error('Error fetching events data:', error);
      showAlert('error', 'Failed to load events data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) return;

    const formData = new FormData();
    formData.append('banner', bannerFile);

    try {
      const response = await fetch(`${BASE_URL}/api/events/banner`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setEventsData(prev => prev ? { ...prev, bannerImage: data.bannerImage } : null);
        setBannerFile(null);
        showAlert('success', 'Banner uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      showAlert('error', 'Failed to upload banner');
    }
  };

  // Section management functions
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

      const response = await fetch(`${BASE_URL}/api/events/sections`, {
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
        fetchEventsData();
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
      const response = await fetch(`${BASE_URL}/api/events/sections/${editingSectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionName: newSectionName,
          sectionTitle: newSectionTitle || undefined,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setNewSectionName('');
        setNewSectionTitle('');
        setEditingSectionId('');
        setShowEditSectionModal(false);
        showAlert('success', 'Section updated successfully!');
        fetchEventsData();
      } else {
        showAlert('error', responseData.error || 'Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      showAlert('error', 'Failed to update section');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its images?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/events/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showAlert('success', 'Section deleted successfully!');
        fetchEventsData();
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
      const response = await fetch(`${BASE_URL}/api/events/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Reset form
        setImageFiles(null);
        setImagePreviews([]);
        setImageTitle('');
        setImageDescription('');
        setUploadingSectionId('');
        setShowImageModal(false);
        
        showAlert('success', 'Images uploaded successfully!');
        fetchEventsData();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showAlert('error', 'Failed to upload images');
    }
  };

  const deleteImage = async (sectionId: string, imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/events/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showAlert('success', 'Image deleted successfully!');
        fetchEventsData();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showAlert('error', 'Failed to delete image');
    }
  };

  const toggleImageActive = async (imageId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/events/images/${imageId}/toggle-active`, {
        method: 'PUT',
      });

      if (response.ok) {
        const result = await response.json();
        showAlert('success', result.message || 'Image status updated successfully!');
        fetchEventsData();
      } else {
        showAlert('error', 'Failed to update image status');
      }
    } catch (error) {
      console.error('Error toggling image active status:', error);
      showAlert('error', 'Failed to update image status');
    }
  };

  const openEditSectionModal = (section: EventsSection) => {
    setEditingSectionId(section.id);
    setNewSectionName(section.sectionName);
    setNewSectionTitle(section.sectionTitle || '');
    setShowEditSectionModal(true);
  };

  const openImageUploadModal = (sectionId: string) => {
    setUploadingSectionId(sectionId);
    setShowImageModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    setSaving(true);

    try {
      const contentToSave = showSource ? htmlContent : editor.getHTML();
      const updatedEventsData = {
        slug: eventsData?.slug || 'events',
        title: eventsData?.title || 'Events',
        content: contentToSave,
        bannerImage: eventsData?.bannerImage || '',
        sections: eventsData?.sections || []
      };
      
      const response = await fetch(`${BASE_URL}/api/events`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEventsData),
      });

      if (response.ok) {
        showAlert('success', 'Events page updated successfully!');
        fetchEventsData();
      } else {
        showAlert('error', 'Failed to update events page');
      }
    } catch (error) {
      console.error('Error updating events:', error);
      showAlert('error', 'An error occurred while updating');
    } finally {
      setSaving(false);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
  };

  const toggleSource = () => {
    if (showSource && editor) {
      // Apply HTML changes to editor
      editor.commands.setContent(htmlContent);
    }
    setShowSource(!showSource);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toolbarButtonStyle = (active: boolean = false) => ({
    padding: '4px 8px',
    borderRadius: '3px',
    border: '1px solid #ddd',
    backgroundColor: active ? '#e0e0e0' : '#ffffff',
    color: '#333',
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '30px',
    height: '30px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  if (loading) {
    return (
      <AdminLayout title="Events Management">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events Management">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
      <form onSubmit={handleSubmit}>
        {/* Banner Image Section */}
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
            Banner Image
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Upload Banner Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                width: '100%'
              }}
            />
          </div>

          {bannerPreview && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Preview:</p>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                height: '300px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  sizes="(max-width: 600px) 100vw, 600px"
                  priority
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          {bannerFile && (
            <button
              type="button"
              onClick={handleBannerUpload}
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
              Upload Banner
            </button>
          )}
        </div>

        {/* Basic Information */}
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
            Basic Information
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Title
            </label>
            <input
              type="text"
              value={eventsData?.title || ''}
              onChange={(e) => setEventsData(prev => prev ? { ...prev, title: e.target.value } : {
                slug: 'events',
                title: e.target.value,
                content: '',
                bannerImage: '',
                sections: []
              })}
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
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Content (Rich Text Editor)
            </label>
            
            {/* Enhanced Editor Toolbar */}
            <div style={{
              backgroundColor: '#f0f0f0',
              padding: '8px',
              borderRadius: '6px 6px 0 0',
              border: '1px solid #ddd',
              borderBottom: 'none'
            }}>
              {/* First Row */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '8px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={toggleSource}
                  style={{
                    ...toolbarButtonStyle(showSource),
                    minWidth: '70px'
                  }}
                >
                  {showSource ? '📝 Editor' : '📄 Source'}
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                  style={toolbarButtonStyle()}
                >
                  ↶
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  style={toolbarButtonStyle()}
                >
                  ↷
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  style={toolbarButtonStyle(editor?.isActive('bold'))}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  style={toolbarButtonStyle(editor?.isActive('italic'))}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  style={toolbarButtonStyle(editor?.isActive('underline'))}
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  style={toolbarButtonStyle(editor?.isActive('strike'))}
                >
                  <s>S</s>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleSubscript().run()}
                  style={toolbarButtonStyle(editor?.isActive('subscript'))}
                >
                  X₂
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                  style={toolbarButtonStyle(editor?.isActive('superscript'))}
                >
                  X²
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'left' }))}
                >
                  ≡
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'center' }))}
                >
                  ≡
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'right' }))}
                >
                  ≡
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'justify' }))}
                >
                  ≡
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  style={toolbarButtonStyle(editor?.isActive('bulletList'))}
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  style={toolbarButtonStyle(editor?.isActive('orderedList'))}
                >
                  1.
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={addLink}
                  style={toolbarButtonStyle(editor?.isActive('link'))}
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={addImage}
                  style={toolbarButtonStyle()}
                >
                  🖼️
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  style={toolbarButtonStyle()}
                >
                  ⊞
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  style={toolbarButtonStyle(editor?.isActive('codeBlock'))}
                >
                  {'</>'}
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHighlight().run()}
                  style={toolbarButtonStyle(editor?.isActive('highlight'))}
                >
                  🖍️
                </button>
              </div>

              {/* Second Row */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <select
                  onChange={(e) => {
                    const level = parseInt(e.target.value);
                    if (level === 0) {
                      editor?.chain().focus().setParagraph().run();
                    } else {
                      editor?.chain().focus().toggleHeading({ level: level as any }).run();
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    height: '30px'
                  }}
                >
                  <option value="0">Normal</option>
                  <option value="1">Heading 1</option>
                  <option value="2">Heading 2</option>
                  <option value="3">Heading 3</option>
                  <option value="4">Heading 4</option>
                  <option value="5">Heading 5</option>
                  <option value="6">Heading 6</option>
                </select>

                <select
                  onChange={(e) => {
                    const size = e.target.value;
                    editor?.chain().focus().setMark('textStyle', { fontSize: size }).run();
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    height: '30px'
                  }}
                >
                  <option value="">Size</option>
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="28px">28px</option>
                  <option value="32px">32px</option>
                </select>

                <input
                  type="color"
                  onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                  style={{
                    width: '30px',
                    height: '30px',
                    padding: '2px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Editor Content / Source View */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ddd',
              borderRadius: '0 0 6px 6px',
              minHeight: '300px'
            }}>
              {showSource ? (
                <textarea
                  value={htmlContent}
                  onChange={handleSourceChange}
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <EditorContent 
                  editor={editor} 
                  style={{
                    minHeight: '300px',
                    padding: '16px'
                  }}
                />
              )}
            </div>

            {/* Word Count */}
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '0 0 6px 6px',
              fontSize: '12px',
              color: '#666',
              textAlign: 'right'
            }}>
              Words: {editor?.storage.characterCount?.words() || 0}, Characters: {editor?.storage.characterCount?.characters() || 0}
            </div>
          </div>
        </div>


        {/* Dynamic Sections Management */}
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
            Dynamic Sections Management
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setShowAddSectionModal(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + Add New Section
            </button>
          </div>

          {eventsData?.sections && eventsData.sections.length > 0 ? (
            <div>
              <h4 style={{ marginBottom: '16px', color: '#374151' }}>Current Sections ({eventsData.sections.length}):</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {eventsData.sections.map((section) => (
                  <div key={section.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{section.sectionName}</h5>
                        {section.sectionTitle && (
                          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{section.sectionTitle}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openEditSectionModal(section)}
                          style={{
                            backgroundColor: '#3b82f6',
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
                          type="button"
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
                    
                    <div style={{ marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={() => openImageUploadModal(section.id)}
                        style={{
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        + Add Images
                      </button>
                    </div>

                    {section.images && section.images.length > 0 && (
                      <div>
                        <p style={{ marginBottom: '8px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                          Images ({section.images.length}):
                        </p>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: '8px'
                        }}>
                          {section.images.map((image) => (
                            <div key={image.id} style={{
                              position: 'relative',
                              paddingBottom: '100%',
                              border: `2px solid ${image.isActive !== false ? '#10b981' : '#ef4444'}`,
                              borderRadius: '4px',
                              overflow: 'hidden',
                              opacity: image.isActive !== false ? 1 : 0.6
                            }}>
                              <Image
                                src={`${BASE_URL}${image.url}`}
                                alt={image.title || 'Section image'}
                                fill
                                sizes="120px"
                                style={{ objectFit: 'cover' }}
                              />
                              
                              {/* Status indicator */}
                              <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                backgroundColor: image.isActive !== false ? '#10b981' : '#ef4444',
                                color: 'white',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                fontSize: '8px',
                                fontWeight: 'bold'
                              }}>
                                {image.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                              </div>

                              {/* Action buttons */}
                              <div style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                display: 'flex',
                                gap: '2px'
                              }}>
                                <button
                                  type="button"
                                  onClick={() => toggleImageActive(image.id)}
                                  style={{
                                    backgroundColor: image.isActive !== false ? '#f59e0b' : '#10b981',
                                    color: 'white',
                                    padding: '2px 4px',
                                    borderRadius: '2px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '8px',
                                    fontWeight: 'bold'
                                  }}
                                  title={image.isActive !== false ? 'Deactivate' : 'Activate'}
                                >
                                  {image.isActive !== false ? '⏸' : '▶'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteImage(section.id, image.id)}
                                  style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '2px 4px',
                                    borderRadius: '2px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                  }}
                                  title="Delete"
                                >
                                  ×
                                </button>
                              </div>

                              {(image.title || image.description) && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  padding: '4px',
                                  fontSize: '10px'
                                }}>
                                  {image.title && <div style={{ fontWeight: 'bold' }}>{image.title}</div>}
                                  {image.description && <div>{image.description}</div>}
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
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No sections created yet. Click "Add New Section" to get started.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

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
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h4 style={{ marginBottom: '16px' }}>Add New Section</h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Section Name *</label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Section Title (Optional)</label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddSectionModal(false);
                  setNewSectionName('');
                  setNewSectionTitle('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addSection}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
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
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h4 style={{ marginBottom: '16px' }}>Edit Section</h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Section Name *</label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Section Title (Optional)</label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editSection}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
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
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h4 style={{ marginBottom: '16px' }}>Add Images to Section</h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Select Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Image Title (Optional)</label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Image Description (Optional)</label>
              <textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px' }}>Preview:</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{
                      paddingBottom: '100%',
                      position: 'relative',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
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

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setUploadingSectionId('');
                  setImageFiles(null);
                  setImagePreviews([]);
                  setImageTitle('');
                  setImageDescription('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={uploadImages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
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