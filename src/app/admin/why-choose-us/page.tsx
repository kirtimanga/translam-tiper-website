"use client";
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
import { useWhyChooseUs, WhyChooseUsReason, WhyChooseUsProvider } from '@/contexts/WhyChooseUsContext';
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
import '../admission/tiptap.css';

function WhyChooseUsManagement() {
  const { data, updateData, addReason, updateReason, deleteReason } = useWhyChooseUs();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();
  const [editingReason, setEditingReason] = useState<WhyChooseUsReason | null>(null);
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [reasonForm, setReasonForm] = useState<Omit<WhyChooseUsReason, 'id'>>({
    title: '',
    subtitle: '',
    description: '',
    tags: [],
    order: 0,
    isActive: true
  });
  const [tagInput, setTagInput] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

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
    content: data.description || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setHtmlContent(content);
      setFormData({
        ...formData,
        description: content
      });
    },
  });

  useEffect(() => {
    setFormData(data);
    if (editor && data.description) {
      editor.commands.setContent(data.description);
      setHtmlContent(data.description);
    }
  }, [data, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const dataToUpdate = {
        ...formData,
        description: showSource ? htmlContent : (editor?.getHTML() || formData.description)
      };
      
      await updateData(dataToUpdate);
      showAlert('success', 'Why Choose Us content updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      showAlert('error', 'Failed to update Why Choose Us content. Please try again.');
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

  const handleReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReason) {
        await updateReason(editingReason.id, reasonForm);
        showAlert('success', 'Reason updated successfully!');
      } else {
        await addReason(reasonForm);
        showAlert('success', 'Reason added successfully!');
      }

      setShowReasonForm(false);
      setEditingReason(null);
      setReasonForm({
        title: '',
        subtitle: '',
        description: '',
        tags: [],
        order: 0,
        isActive: true
      });
      setTagInput('');
    } catch (error: any) {
      showAlert('error', 'Failed to save reason. Please try again.');
    }
  };

  const handleEditReason = (reason: WhyChooseUsReason) => {
    setEditingReason(reason);
    setReasonForm({
      title: reason.title,
      subtitle: reason.subtitle,
      description: reason.description,
      tags: reason.tags,
      order: reason.order,
      isActive: reason.isActive
    });
    setShowReasonForm(true);
  };

  const handleDeleteReason = async (id: string) => {
    if (confirm('Are you sure you want to delete this reason?')) {
      try {
        await deleteReason(id);
        showAlert('success', 'Reason deleted successfully!');
      } catch (error: any) {
        showAlert('error', 'Failed to delete reason. Please try again.');
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !reasonForm.tags.includes(tagInput.trim())) {
      setReasonForm({
        ...reasonForm,
        tags: [...reasonForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setReasonForm({
      ...reasonForm,
      tags: reasonForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
  };

  const toggleSource = () => {
    if (showSource && editor) {
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

  return (
    <AdminLayout title="Why Choose US Management">
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
            <span>✓</span> Why Choose Us content updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main Content Section */}
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
                        editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
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
                minHeight: '200px'
              }}>
                {showSource ? (
                  <textarea
                    value={htmlContent}
                    onChange={handleSourceChange}
                    style={{
                      width: '100%',
                      minHeight: '200px',
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
                      minHeight: '200px',
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

        {/* Reasons Management */}
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
              Manage Reasons
            </h3>
            <button
              onClick={() => {
                setShowReasonForm(true);
                setEditingReason(null);
                setReasonForm({
                  title: '',
                  subtitle: '',
                  description: '',
                  tags: [],
                  order: data.reasons.length,
                  isActive: true
                });
                setTagInput('');
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
              + Add Reason
            </button>
          </div>

          {/* Reasons List */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.reasons.map((reason, index) => (
              <div 
                key={reason.id}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                      {reason.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#f59e0b', margin: '0 0 8px 0', fontWeight: '500' }}>
                      {reason.subtitle}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                      {reason.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {reason.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          style={{
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span 
                        style={{
                          backgroundColor: reason.isActive ? '#10b981' : '#ef4444',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}
                      >
                        {reason.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        Order: {reason.order}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditReason(reason)}
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
                      onClick={() => handleDeleteReason(reason.id)}
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
              </div>
            ))}
          </div>
        </div>

        {/* Reason Form Modal */}
        {showReasonForm && (
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
                {editingReason ? 'Edit Reason' : 'Add New Reason'}
              </h3>
              
              <form onSubmit={handleReasonSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={reasonForm.title}
                    onChange={(e) => setReasonForm({ ...reasonForm, title: e.target.value })}
                    placeholder="e.g., Academic Excellence"
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
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={reasonForm.subtitle}
                    onChange={(e) => setReasonForm({ ...reasonForm, subtitle: e.target.value })}
                    placeholder="e.g., ENGINEERING & MANAGEMENT"
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
                    Description
                  </label>
                  <textarea
                    value={reasonForm.description}
                    onChange={(e) => setReasonForm({ ...reasonForm, description: e.target.value })}
                    placeholder="Detailed description..."
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
                    Tags
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
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
                      onClick={addTag}
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {reasonForm.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        style={{
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#3730a3',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
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
                    value={reasonForm.order}
                    onChange={(e) => setReasonForm({ ...reasonForm, order: parseInt(e.target.value) })}
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
                      checked={reasonForm.isActive}
                      onChange={(e) => setReasonForm({ ...reasonForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReasonForm(false);
                      setEditingReason(null);
                      setTagInput('');
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
                    {editingReason ? 'Update' : 'Add'} Reason
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

export default function WhyChooseUsManagementPage() {
  return (
    <WhyChooseUsProvider>
      <WhyChooseUsManagement />
    </WhyChooseUsProvider>
  );
}