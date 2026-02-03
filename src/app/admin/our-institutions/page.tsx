"use client";
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useOurInstitutions, Institution } from '@/contexts/OurInstitutionsContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
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

export default function OurInstitutionsManagement() {
  const { data, updateData, addInstitution, updateInstitution, deleteInstitution } = useOurInstitutions();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [institutionForm, setInstitutionForm] = useState<Omit<Institution, 'id'>>({
    icon: '',
    title: '',
    subtitle: '',
    description: '',
    highlights: [],
    color: '#FF6B6B',
    order: 0,
    isActive: true
  });

  // Source view states
  const [showDescriptionSource, setShowDescriptionSource] = useState(false);
  const [showFeaturedDescriptionSource, setShowFeaturedDescriptionSource] = useState(false);
  const [descriptionHtmlContent, setDescriptionHtmlContent] = useState('');
  const [featuredDescriptionHtmlContent, setFeaturedDescriptionHtmlContent] = useState('');

  // TipTap editors for description and featured description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Image,
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
      handleChange('description', editor.getHTML());
      setDescriptionHtmlContent(editor.getHTML());
    },
  });

  const featuredDescriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Image,
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
      handleChange('featuredDescription', editor.getHTML());
      setFeaturedDescriptionHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    setFormData(data);
    // Update editor content when data changes
    if (descriptionEditor && data.description) {
      descriptionEditor.commands.setContent(data.description);
      setDescriptionHtmlContent(data.description);
    }
    if (featuredDescriptionEditor && data.featuredDescription) {
      featuredDescriptionEditor.commands.setContent(data.featuredDescription);
      setFeaturedDescriptionHtmlContent(data.featuredDescription);
    }
  }, [data, descriptionEditor, featuredDescriptionEditor]);

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
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentVal = (formData[parent as keyof typeof formData] as any) ?? {};
      setFormData({
        ...formData,
        [parent]: {
          ...(typeof parentVal === 'object' && parentVal !== null ? parentVal : {}),
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleInstitutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingInstitution) {
      updateInstitution(editingInstitution.id, institutionForm);
    } else {
      addInstitution(institutionForm);
    }

    setShowInstitutionForm(false);
    setEditingInstitution(null);
    setInstitutionForm({
      icon: '',
      title: '',
      subtitle: '',
      description: '',
      highlights: [],
      color: '#FF6B6B',
      order: 0,
      isActive: true
    });
  };

  const handleEditInstitution = (institution: Institution) => {
    setEditingInstitution(institution);
    setInstitutionForm({
      icon: institution.icon,
      title: institution.title,
      subtitle: institution.subtitle,
      description: institution.description,
      highlights: institution.highlights,
      color: institution.color,
      order: institution.order,
      isActive: institution.isActive
    });
    setShowInstitutionForm(true);
  };

  const handleDeleteInstitution = (id: string) => {
    if (confirm('Are you sure you want to delete this institution?')) {
      deleteInstitution(id);
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...institutionForm.highlights];
    newHighlights[index] = value;
    setInstitutionForm({ ...institutionForm, highlights: newHighlights });
  };

  const addHighlight = () => {
    setInstitutionForm({ 
      ...institutionForm, 
      highlights: [...institutionForm.highlights, ''] 
    });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = institutionForm.highlights.filter((_, i) => i !== index);
    setInstitutionForm({ ...institutionForm, highlights: newHighlights });
  };

  // TipTap toolbar functions
  const addLink = (editor: any) => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = (editor: any) => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toggleDescriptionSource = () => {
    if (showDescriptionSource && descriptionEditor) {
      // Apply HTML changes to editor
      descriptionEditor.commands.setContent(descriptionHtmlContent);
    }
    setShowDescriptionSource(!showDescriptionSource);
  };

  const toggleFeaturedDescriptionSource = () => {
    if (showFeaturedDescriptionSource && featuredDescriptionEditor) {
      // Apply HTML changes to editor
      featuredDescriptionEditor.commands.setContent(featuredDescriptionHtmlContent);
    }
    setShowFeaturedDescriptionSource(!showFeaturedDescriptionSource);
  };

  const handleDescriptionSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionHtmlContent(e.target.value);
  };

  const handleFeaturedDescriptionSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeaturedDescriptionHtmlContent(e.target.value);
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

  const renderToolbar = (editor: any, isDescription: boolean) => (
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
          onClick={isDescription ? toggleDescriptionSource : toggleFeaturedDescriptionSource}
          style={{
            ...toolbarButtonStyle(isDescription ? showDescriptionSource : showFeaturedDescriptionSource),
            minWidth: '70px'
          }}
        >
          {(isDescription ? showDescriptionSource : showFeaturedDescriptionSource) ? '📝 Editor' : '📄 Source'}
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
          onClick={() => addLink(editor)}
          style={toolbarButtonStyle(editor?.isActive('link'))}
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => addImage(editor)}
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
  );

  return (
    <AdminLayout title="Our Institutions Management">
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
            <span>✓</span> Our Institutions content updated successfully!
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
              Main Content
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
                Description
              </label>
              <div>
                {renderToolbar(descriptionEditor, true)}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '200px'
                }}>
                  {showDescriptionSource ? (
                    <textarea
                      value={descriptionHtmlContent}
                      onChange={handleDescriptionSourceChange}
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
                      editor={descriptionEditor} 
                      style={{
                        minHeight: '200px',
                        padding: '16px'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
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
              Statistics
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '12px'
                }}>
                  Institutions Count
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.institutions}
                    onChange={(e) => handleChange('stats.institutions', e.target.value)}
                    placeholder="e.g., 4"
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.stats.institutionsLabel}
                    onChange={(e) => handleChange('stats.institutionsLabel', e.target.value)}
                    placeholder="Label"
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '12px'
                }}>
                  Years of Excellence
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.yearsExcellence}
                    onChange={(e) => handleChange('stats.yearsExcellence', e.target.value)}
                    placeholder="e.g., 38+"
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.stats.yearsExcellenceLabel}
                    onChange={(e) => handleChange('stats.yearsExcellenceLabel', e.target.value)}
                    placeholder="Label"
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Featured Section */}
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
              Featured Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Featured Title
              </label>
              <input
                type="text"
                value={formData.featuredTitle}
                onChange={(e) => handleChange('featuredTitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Featured Description
              </label>
              <div>
                {renderToolbar(featuredDescriptionEditor, false)}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '150px'
                }}>
                  {showFeaturedDescriptionSource ? (
                    <textarea
                      value={featuredDescriptionHtmlContent}
                      onChange={handleFeaturedDescriptionSourceChange}
                      style={{
                        width: '100%',
                        minHeight: '150px',
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
                      editor={featuredDescriptionEditor} 
                      style={{
                        minHeight: '150px',
                        padding: '16px'
                      }}
                    />
                  )}
                </div>
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

        {/* Institutions Management */}
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
              Manage Institutions
            </h3>
            <button
              onClick={() => {
                setShowInstitutionForm(true);
                setEditingInstitution(null);
                setInstitutionForm({
                  icon: '',
                  title: '',
                  subtitle: '',
                  description: '',
                  highlights: [],
                  color: '#FF6B6B',
                  order: data.institutions.length,
                  isActive: true
                });
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
              + Add Institution
            </button>
          </div>

          {/* Institutions List */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.institutions.map((institution, index) => (
              <div 
                key={institution.id}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{institution.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                      {institution.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                      {institution.subtitle}
                    </p>
                  </div>
                  <span 
                    style={{
                      backgroundColor: institution.isActive ? '#10b981' : '#ef4444',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    {institution.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditInstitution(institution)}
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
                    onClick={() => handleDeleteInstitution(institution.id)}
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

        {/* Institution Form Modal */}
        {showInstitutionForm && (
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
                {editingInstitution ? 'Edit Institution' : 'Add New Institution'}
              </h3>
              
              <form onSubmit={handleInstitutionSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={institutionForm.icon}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, icon: e.target.value })}
                    placeholder="📄"
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={institutionForm.title}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, title: e.target.value })}
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
                    value={institutionForm.subtitle}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, subtitle: e.target.value })}
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
                    value={institutionForm.description}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, description: e.target.value })}
                    rows={4}
                    required
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
                    Color
                  </label>
                  <input
                    type="color"
                    value={institutionForm.color}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, color: e.target.value })}
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
                    Order
                  </label>
                  <input
                    type="number"
                    value={institutionForm.order}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, order: parseInt(e.target.value) })}
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
                      checked={institutionForm.isActive}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Highlights
                    </label>
                    <button
                      type="button"
                      onClick={addHighlight}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Add
                    </button>
                  </div>
                  {institutionForm.highlights.map((highlight, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                        placeholder="Highlight text"
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInstitutionForm(false);
                      setEditingInstitution(null);
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
                    {editingInstitution ? 'Update' : 'Add'} Institution
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