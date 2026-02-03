"use client";
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useOurSuccess } from '@/contexts/OurSuccessContext';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
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
import '../admission/tiptap.css';

export default function OurSuccessManagement() {
  const { data, updateData } = useOurSuccess();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();

  const editor = useEditor({
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
    content: data.description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
      handleChange('description', editor.getHTML());
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
      // Update description from editor if not in source mode
      const updatedFormData = {
        ...formData,
        description: showSource ? htmlContent : (editor?.getHTML() || formData.description)
      };
      
      // Update the context and get response
      const response = await updateData(updatedFormData);
      
      // Handle the API response for alert
      if (response) {
        handleApiResponse(response);
      }
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (_error) {
      // _error is intentionally unused; we keep a generic message for the user
      showAlert('error', 'Failed to update Our Success data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // Support updating nested stats fields like "stats.graduates"
    if (field.startsWith('stats.')) {
      const [, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [child]: value,
        }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    } as typeof prev));
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

  return (
    <AdminLayout title="Our Success Management">
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
            <span>✓</span> Our Success content updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title and Description Section */}
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
                      const level = parseInt(e.target.value, 10);
                      if (level === 0) {
                        editor?.chain().focus().setParagraph().run();
                      } else {
                        // TipTap expects a numeric level
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
              {/* Successful Graduates */}
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
                  Successful Graduates
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.graduates}
                    onChange={(e) => handleChange('stats.graduates', e.target.value)}
                    placeholder="e.g., 5000+"
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
                    value={formData.stats.graduatesLabel}
                    onChange={(e) => handleChange('stats.graduatesLabel', e.target.value)}
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

              {/* Alumni */}
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
                  Alumni
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.alumni}
                    onChange={(e) => handleChange('stats.alumni', e.target.value)}
                    placeholder="e.g., 15000+"
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
                    value={formData.stats.alumniLabel}
                    onChange={(e) => handleChange('stats.alumniLabel', e.target.value)}
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

              {/* Years of Excellence */}
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
                    placeholder="e.g., 38"
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

              {/* Recruiters */}
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
                  Recruiters
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.stats.recruiters}
                    onChange={(e) => handleChange('stats.recruiters', e.target.value)}
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
                    value={formData.stats.recruitersLabel}
                    onChange={(e) => handleChange('stats.recruitersLabel', e.target.value)}
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

              {/* Placement Success Rate */}
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
                  Placement Success Rate
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
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSaving ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }}></span>
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}