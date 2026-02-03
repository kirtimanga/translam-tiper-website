"use client";
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useOurRecruiters, Recruiter, OurRecruitersProvider } from '@/contexts/OurRecruitersContext';
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

function OurRecruitersManagement() {
  const { data, updateData, addRecruiter, updateRecruiter, deleteRecruiter } = useOurRecruiters();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [showRecruiterForm, setShowRecruiterForm] = useState(false);
  const [recruiterForm, setRecruiterForm] = useState<Omit<Recruiter, 'id'>>({
    name: '',
    logo: '',
    category: '',
    isFeatured: false,
    order: 0,
    isActive: true
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Source view states
  const [showDescriptionSource, setShowDescriptionSource] = useState(false);
  const [showCtaDescriptionSource, setShowCtaDescriptionSource] = useState(false);
  const [descriptionHtmlContent, setDescriptionHtmlContent] = useState('');
  const [ctaDescriptionHtmlContent, setCtaDescriptionHtmlContent] = useState('');

  // TipTap editors for description and CTA description
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
      CharacterCount,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      handleChange('description', editor.getHTML());
      setDescriptionHtmlContent(editor.getHTML());
    },
  });

  const ctaDescriptionEditor = useEditor({
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
      handleChange('callToAction.description', editor.getHTML());
      setCtaDescriptionHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    setFormData(data);
    // Update editor content when data changes
    if (descriptionEditor && data.description) {
      descriptionEditor.commands.setContent(data.description);
      setDescriptionHtmlContent(data.description);
    }
    if (ctaDescriptionEditor && data.callToAction.description) {
      ctaDescriptionEditor.commands.setContent(data.callToAction.description);
      setCtaDescriptionHtmlContent(data.callToAction.description);
    }
  }, [data, descriptionEditor, ctaDescriptionEditor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      updateData(formData);
      
      setTimeout(() => {
        setIsSaving(false);
        showAlert('success', 'Our Recruiters content updated successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }, 500);
    } catch (error) {
      setIsSaving(false);
      showAlert('error', 'Failed to update content. Please try again.');
    }
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

  const handleRecruiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecruiter) {
        updateRecruiter(editingRecruiter.id, recruiterForm);
        showAlert('success', 'Recruiter updated successfully!');
      } else {
        addRecruiter(recruiterForm);
        showAlert('success', 'Recruiter added successfully!');
      }

      setShowRecruiterForm(false);
      setEditingRecruiter(null);
      setRecruiterForm({
        name: '',
        logo: '',
        category: '',
        isFeatured: false,
        order: 0,
        isActive: true
      });
      setLogoPreview('');
    } catch (error) {
      showAlert('error', 'Failed to save recruiter. Please try again.');
    }
  };

  const handleEditRecruiter = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setRecruiterForm({
      name: recruiter.name,
      logo: recruiter.logo,
      category: recruiter.category,
      isFeatured: recruiter.isFeatured,
      order: recruiter.order,
      isActive: recruiter.isActive
    });
    setLogoPreview(recruiter.logo);
    setShowRecruiterForm(true);
  };

  const handleDeleteRecruiter = (id: string) => {
    if (confirm('Are you sure you want to delete this recruiter?')) {
      try {
        deleteRecruiter(id);
        showAlert('success', 'Recruiter deleted successfully!');
      } catch (error) {
        showAlert('error', 'Failed to delete recruiter. Please try again.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Image size should be less than 5MB');
        return;
      }

      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setRecruiterForm({ ...recruiterForm, logo: base64String });
        setLogoPreview(base64String);
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        showAlert('error', 'Error reading file');
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setRecruiterForm({ ...recruiterForm, logo: '' });
    setLogoPreview('');
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
      descriptionEditor.commands.setContent(descriptionHtmlContent);
    }
    setShowDescriptionSource(!showDescriptionSource);
  };

  const toggleCtaDescriptionSource = () => {
    if (showCtaDescriptionSource && ctaDescriptionEditor) {
      ctaDescriptionEditor.commands.setContent(ctaDescriptionHtmlContent);
    }
    setShowCtaDescriptionSource(!showCtaDescriptionSource);
  };

  const handleDescriptionSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionHtmlContent(e.target.value);
  };

  const handleCtaDescriptionSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCtaDescriptionHtmlContent(e.target.value);
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
          onClick={isDescription ? toggleDescriptionSource : toggleCtaDescriptionSource}
          style={{
            ...toolbarButtonStyle(isDescription ? showDescriptionSource : showCtaDescriptionSource),
            minWidth: '70px'
          }}
        >
          {(isDescription ? showDescriptionSource : showCtaDescriptionSource) ? '📝 Editor' : '📄 Source'}
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
    <AdminLayout title="Our Recruiters Management">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={hideAlert}
          />
        )}
        
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
            <span>✓</span> Our Recruiters content updated successfully!
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
                  Partner Companies
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.partnerCompanies}
                    onChange={(e) => handleChange('stats.partnerCompanies', e.target.value)}
                    placeholder="e.g., 100+"
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
                    value={formData.stats.partnerCompaniesLabel}
                    onChange={(e) => handleChange('stats.partnerCompaniesLabel', e.target.value)}
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
                  Placement Rate
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.placementRate}
                    onChange={(e) => handleChange('stats.placementRate', e.target.value)}
                    placeholder="e.g., 90%"
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
                    value={formData.stats.placementRateLabel}
                    onChange={(e) => handleChange('stats.placementRateLabel', e.target.value)}
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
                  Average Package
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.averagePackage}
                    onChange={(e) => handleChange('stats.averagePackage', e.target.value)}
                    placeholder="e.g., ₹12L"
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
                    value={formData.stats.averagePackageLabel}
                    onChange={(e) => handleChange('stats.averagePackageLabel', e.target.value)}
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

          {/* Section Titles */}
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
              Section Titles
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
                All Partners Title
              </label>
              <input
                type="text"
                value={formData.allPartnersTitle}
                onChange={(e) => handleChange('allPartnersTitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Call to Action Section */}
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
              Call to Action
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                CTA Title
              </label>
              <input
                type="text"
                value={formData.callToAction.title}
                onChange={(e) => handleChange('callToAction.title', e.target.value)}
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
                CTA Description
              </label>
              <div>
                {renderToolbar(ctaDescriptionEditor, false)}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '150px'
                }}>
                  {showCtaDescriptionSource ? (
                    <textarea
                      value={ctaDescriptionHtmlContent}
                      onChange={handleCtaDescriptionSourceChange}
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
                      editor={ctaDescriptionEditor} 
                      style={{
                        minHeight: '150px',
                        padding: '16px'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Button Text
              </label>
              <input
                type="text"
                value={formData.callToAction.buttonText}
                onChange={(e) => handleChange('callToAction.buttonText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
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

        {/* Recruiters Management */}
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
              Manage Recruiters
            </h3>
            <button
              onClick={() => {
                setShowRecruiterForm(true);
                setEditingRecruiter(null);
                setRecruiterForm({
                  name: '',
                  logo: '',
                  category: '',
                  isFeatured: false,
                  order: data.recruiters.length,
                  isActive: true
                });
                setLogoPreview('');
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
              + Add Recruiter
            </button>
          </div>

          {/* Recruiters List */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.recruiters.map((recruiter, index) => (
              <div 
                key={recruiter.id}
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
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {recruiter.logo ? (
                      <Image
                        src={recruiter.logo}
                        alt={recruiter.name}
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>No Logo</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                      {recruiter.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                      {recruiter.category}
                    </p>
                  </div>
                  <span 
                    style={{
                      backgroundColor: recruiter.isFeatured ? '#f59e0b' : '#6b7280',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    {recruiter.isFeatured ? 'Featured' : 'Regular'}
                  </span>
                  <span 
                    style={{
                      backgroundColor: recruiter.isActive ? '#10b981' : '#ef4444',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    {recruiter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditRecruiter(recruiter)}
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
                    onClick={() => handleDeleteRecruiter(recruiter.id)}
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

        {/* Recruiter Form Modal */}
        {showRecruiterForm && (
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
                {editingRecruiter ? 'Edit Recruiter' : 'Add New Recruiter'}
              </h3>
              
              <form onSubmit={handleRecruiterSubmit}>
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
                    value={recruiterForm.name}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                    placeholder="e.g., Havells"
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
                    Company Logo
                  </label>
                  
                  {/* Image Preview */}
                  {(logoPreview || recruiterForm.logo) && (
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
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Image
                          src={logoPreview || recruiterForm.logo}
                          alt="Logo preview"
                          width={60}
                          height={60}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0', fontSize: '14px', color: '#374151' }}>
                          Logo uploaded successfully
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
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
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
                          {(logoPreview || recruiterForm.logo) ? 'Change Logo' : 'Upload Logo'}
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
                    Category
                  </label>
                  <input
                    type="text"
                    value={recruiterForm.category}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, category: e.target.value })}
                    placeholder="e.g., Manufacturing, Technology, Healthcare"
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
                    Order
                  </label>
                  <input
                    type="number"
                    value={recruiterForm.order}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, order: parseInt(e.target.value) })}
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
                      checked={recruiterForm.isFeatured}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, isFeatured: e.target.checked })}
                    />
                    Featured Recruiter
                  </label>
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
                      checked={recruiterForm.isActive}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecruiterForm(false);
                      setEditingRecruiter(null);
                      setLogoPreview('');
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
                    {editingRecruiter ? 'Update' : 'Add'} Recruiter
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

export default function OurRecruitersManagementPage() {
  return (
    <OurRecruitersProvider>
      <OurRecruitersManagement />
    </OurRecruitersProvider>
  );
}