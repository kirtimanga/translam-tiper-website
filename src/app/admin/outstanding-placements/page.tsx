"use client";
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';
import { useState, useEffect } from 'react';
import { useOutstandingPlacements, OutstandingPlacement, OutstandingPlacementsProvider } from '@/contexts/OutstandingPlacementsContext';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
import Image from "next/image";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
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

function OutstandingPlacementsManagement() {
  const { data, updateData, addPlacement, updatePlacement, deletePlacement } = useOutstandingPlacements();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();
  const [editingPlacement, setEditingPlacement] = useState<OutstandingPlacement | null>(null);
  const [showPlacementForm, setShowPlacementForm] = useState(false);
  const [placementForm, setPlacementForm] = useState<Omit<OutstandingPlacement, 'id'>>({
    name: '',
    company: '',
    image: '',
    order: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Source view states
  const [showDescriptionSource, setShowDescriptionSource] = useState(false);
  const [descriptionHtmlContent, setDescriptionHtmlContent] = useState('');

  // TipTap editor for description
  const descriptionEditor = useEditor({
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
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      handleChange('description', editor.getHTML());
      setDescriptionHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    setFormData(data);
    // Update editor content when data changes
    if (descriptionEditor && data.description) {
      descriptionEditor.commands.setContent(data.description);
      setDescriptionHtmlContent(data.description);
    }
  }, [data, descriptionEditor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateData(formData);
      showAlert('success', 'Outstanding Placements content updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating data:', error);
      showAlert('error', 'Failed to update Outstanding Placements content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handlePlacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlacement) {
        await updatePlacement(editingPlacement.id, placementForm);
        showAlert('success', 'Placement updated successfully!');
      } else {
        await addPlacement(placementForm);
        showAlert('success', 'Placement added successfully!');
      }

      setShowPlacementForm(false);
      setEditingPlacement(null);
      setPlacementForm({
        name: '',
        company: '',
        image: '',
        order: 0,
        isActive: true
      });
      setImagePreview('');
    } catch (error) {
      console.error('Error saving placement:', error);
      showAlert('error', 'Failed to save placement. Please try again.');
    }
  };

  const handleEditPlacement = (placement: OutstandingPlacement) => {
    setEditingPlacement(placement);
    // Ensure the image URL is absolute for proper display in form
    const imageUrl = placement.image?.startsWith('/uploads/') 
  ? `${BASE_URL}${placement.image}`
      : placement.image;
    
    setPlacementForm({
      name: placement.name,
      company: placement.company,
      image: imageUrl,
      order: placement.order,
      isActive: placement.isActive
    });
    setImagePreview(imageUrl);
    setShowPlacementForm(true);
  };

  const handleDeletePlacement = async (id: string) => {
    if (confirm('Are you sure you want to delete this placement?')) {
      try {
        await deletePlacement(id);
        showAlert('success', 'Placement deleted successfully!');
      } catch (error) {
        console.error('Error deleting placement:', error);
        showAlert('error', 'Failed to delete placement. Please try again.');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Image size should be less than 5MB');
        return;
      }

      setIsUploadingImage(true);
      
      try {
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
  const response = await fetch(`${BASE_URL}/api/outstanding-placements/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // Convert relative URL to absolute URL for proper display
          const imageUrl = data.url.startsWith('/uploads/') 
            ? `${BASE_URL}${data.url}`
            : data.url;
          setPlacementForm({ ...placementForm, image: imageUrl });
          setImagePreview(imageUrl);
          showAlert('success', 'Image uploaded successfully!');
        } else {
          const error = await response.json();
          showAlert('error', error.error || 'Failed to upload image');
        }
      } catch (error) {
        showAlert('error', 'Failed to upload image');
        console.error('Upload error:', error);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const removeImage = () => {
    setPlacementForm({ ...placementForm, image: '' });
    setImagePreview('');
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && descriptionEditor) {
      descriptionEditor.chain().focus().setLink({ href: url }).run();
      showAlert('success', 'Link added successfully!');
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && descriptionEditor) {
      descriptionEditor.chain().focus().setImage({ src: url }).run();
      showAlert('success', 'Image added successfully!');
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

  return (
    <AdminLayout title="Outstanding Placements Management">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
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
            <span>✓</span> Outstanding Placements content updated successfully!
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
                Section Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Incredibly Outstanding Placements"
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
                Section Description
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
                    onClick={() => setShowDescriptionSource(!showDescriptionSource)}
                    style={{
                      ...toolbarButtonStyle(showDescriptionSource),
                      minWidth: '70px'
                    }}
                  >
                    {showDescriptionSource ? '📝 Editor' : '📄 Source'}
                  </button>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().undo().run()}
                    disabled={!descriptionEditor?.can().undo()}
                    style={toolbarButtonStyle()}
                  >
                    ↶
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().redo().run()}
                    disabled={!descriptionEditor?.can().redo()}
                    style={toolbarButtonStyle()}
                  >
                    ↷
                  </button>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleBold().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('bold'))}
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleItalic().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('italic'))}
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleUnderline().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('underline'))}
                  >
                    <u>U</u>
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleStrike().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('strike'))}
                  >
                    <s>S</s>
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleSubscript().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('subscript'))}
                  >
                    X₂
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleSuperscript().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('superscript'))}
                  >
                    X²
                  </button>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().setTextAlign('left').run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive({ textAlign: 'left' }))}
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().setTextAlign('center').run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive({ textAlign: 'center' }))}
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().setTextAlign('right').run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive({ textAlign: 'right' }))}
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().setTextAlign('justify').run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive({ textAlign: 'justify' }))}
                  >
                    ≡
                  </button>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleBulletList().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('bulletList'))}
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleOrderedList().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('orderedList'))}
                  >
                    1.
                  </button>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <button
                    type="button"
                    onClick={addLink}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('link'))}
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
                    onClick={() => descriptionEditor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    style={toolbarButtonStyle()}
                  >
                    ⊞
                  </button>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleCodeBlock().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('codeBlock'))}
                  >
                    {'</>'}
                  </button>
                  <button
                    type="button"
                    onClick={() => descriptionEditor?.chain().focus().toggleHighlight().run()}
                    style={toolbarButtonStyle(descriptionEditor?.isActive('highlight'))}
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
                        descriptionEditor?.chain().focus().setParagraph().run();
                      } else {
                        descriptionEditor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
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
                    defaultValue={0}
                  >
                    <option value="0">Paragraph</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                    <option value="4">Heading 4</option>
                    <option value="5">Heading 5</option>
                    <option value="6">Heading 6</option>
                  </select>
                  
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                  
                  <input
                    type="color"
                    onChange={(e) => descriptionEditor?.chain().focus().setColor(e.target.value).run()}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Text Color"
                  />
                  
                  <input
                    type="color"
                    onChange={(e) => descriptionEditor?.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Highlight Color"
                  />
                </div>
              </div>
              
              {/* Editor Content */}
              {showDescriptionSource ? (
                <textarea
                  value={descriptionHtmlContent}
                  onChange={(e) => {
                    setDescriptionHtmlContent(e.target.value);
                    descriptionEditor?.commands.setContent(e.target.value);
                    handleChange('description', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '16px',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  placeholder="HTML source code..."
                />
              ) : (
                <EditorContent 
                  editor={descriptionEditor} 
                  style={{
                    minHeight: '400px',
                    padding: '16px',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px'
                  }}
                />
              )}
              
              {/* Word Count */}
              {descriptionEditor && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>
                    Words: {descriptionEditor.storage.characterCount?.words() || 0}
                  </span>
                  <span>
                    Characters: {descriptionEditor.storage.characterCount?.characters() || 0}
                  </span>
                </div>
              )}
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

        {/* Placements Management */}
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
              Manage Placements
            </h3>
            <button
              onClick={() => {
                setShowPlacementForm(true);
                setEditingPlacement(null);
                setPlacementForm({
                  name: '',
                  company: '',
                  image: '',
                  order: data.placements.length,
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
              + Add Placement
            </button>
          </div>

          {/* Placements Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {data.placements.map((placement, index) => (
              <div 
                key={placement.id}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  {placement.image ? (
                    <Image
                      src={placement.image.startsWith('/uploads/') 
                        ? `${BASE_URL}${placement.image}`
                        : placement.image}
                      alt={placement.name}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>No Image</span>
                  )}
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                    {placement.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    {placement.company}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', justifyContent: 'center' }}>
                  <span 
                    style={{
                      backgroundColor: placement.isActive ? '#10b981' : '#ef4444',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    {placement.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Order: {placement.order}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleEditPlacement(placement)}
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
                    onClick={() => handleDeletePlacement(placement.id)}
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
            ))}
          </div>
        </div>

        {/* Placement Form Modal */}
        {showPlacementForm && (
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
                {editingPlacement ? 'Edit Placement' : 'Add New Placement'}
              </h3>
              
              <form onSubmit={handlePlacementSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={placementForm.name}
                    onChange={(e) => setPlacementForm({ ...placementForm, name: e.target.value })}
                    placeholder="e.g., John Doe"
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={placementForm.company}
                    onChange={(e) => setPlacementForm({ ...placementForm, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft, etc."
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
                    Student Photo
                  </label>
                  
                  {/* Image Preview */}
                  {(imagePreview || placementForm.image) && (
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
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Image
                          src={imagePreview || placementForm.image}
                          alt="Student preview"
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
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
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
                          {(imagePreview || placementForm.image) ? 'Change Photo' : 'Upload Photo'}
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
                    Order
                  </label>
                  <input
                    type="number"
                    value={placementForm.order}
                    onChange={(e) => setPlacementForm({ ...placementForm, order: parseInt(e.target.value) })}
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
                      checked={placementForm.isActive}
                      onChange={(e) => setPlacementForm({ ...placementForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlacementForm(false);
                      setEditingPlacement(null);
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
                    {editingPlacement ? 'Update' : 'Add'} Placement
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

export default function OutstandingPlacementsManagementPage() {
  return (
    <OutstandingPlacementsProvider>
      <OutstandingPlacementsManagement />
    </OutstandingPlacementsProvider>
  );
}