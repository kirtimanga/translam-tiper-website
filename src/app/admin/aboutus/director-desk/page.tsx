"use client";
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useDirectorDesk } from '@/contexts/DirectorDeskContext';
import { compressImage, getImageSizeInKB } from '@/utils/imageCompression';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Image from 'next/image';
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

export default function DirectorDeskManagement() {
  const { directorDeskData, updateDirectorDeskData } = useDirectorDesk();
  const [formData, setFormData] = useState(directorDeskData);
  const [isLoading, setIsLoading] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();
  const [showSource, setShowSource] = useState(false);
  const [htmlContent, setHtmlContent] = useState(directorDeskData.content || '');

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
    content: directorDeskData.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      setFormData({ ...formData, content: html });
    },
  });

  // Update form data and editor when context data changes
  useEffect(() => {
    setFormData(directorDeskData);
    if (editor && directorDeskData.content) {
      editor.commands.setContent(directorDeskData.content);
      setHtmlContent(directorDeskData.content);
    }
  }, [directorDeskData, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log the data being saved for debugging
      console.log('Saving Director Desk data:', formData);
      
      // Check data size before saving
      const dataSize = new Blob([JSON.stringify(formData)]).size;
      console.log('Data size:', dataSize, 'bytes');
      
      // Update the context data
      await updateDirectorDeskData(formData);
      console.log('Data successfully saved to backend');
      
      showAlert('success', 'Director Desk content updated successfully!');
    } catch (error) {
      console.error('Error saving Director Desk data:', error);
      showAlert('error', `Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Check original size
          const originalSizeKB = getImageSizeInKB(base64String);
          console.log(`Original image size: ${originalSizeKB}KB`);
          
          // Compress image if it's larger than 100KB
          let finalImage = base64String;
          if (originalSizeKB > 100) {
            showAlert('info', 'Compressing image...');
            finalImage = await compressImage(base64String, 600, 0.6);
            const compressedSizeKB = getImageSizeInKB(finalImage);
            console.log(`Compressed image size: ${compressedSizeKB}KB`);
          }
          
          setFormData({ ...formData, heroBannerImage: finalImage });
        } catch (error) {
          console.error('Error processing image:', error);
          showAlert('error', 'Failed to process image. Please try again.');
        }
      };
      reader.onerror = () => {
        showAlert('error', 'Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStaffImageUpload = (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Check original size
          const originalSizeKB = getImageSizeInKB(base64String);
          console.log(`Original staff image size: ${originalSizeKB}KB`);
          
          // Compress image if it's larger than 50KB (smaller for staff images)
          let finalImage = base64String;
          if (originalSizeKB > 50) {
            showAlert('info', 'Compressing image...');
            finalImage = await compressImage(base64String, 300, 0.7);
            const compressedSizeKB = getImageSizeInKB(finalImage);
            console.log(`Compressed staff image size: ${compressedSizeKB}KB`);
          }
          
          const newStaffMembers = [...formData.staffMembers];
          newStaffMembers[index] = { ...newStaffMembers[index], image: finalImage };
          setFormData({ ...formData, staffMembers: newStaffMembers });
        } catch (error) {
          console.error('Error processing staff image:', error);
          showAlert('error', 'Failed to process image. Please try again.');
        }
      };
      reader.onerror = () => {
        showAlert('error', 'Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSource = () => {
    setShowSource(!showSource);
    if (!showSource && editor) {
      setHtmlContent(editor.getHTML());
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    setFormData({ ...formData, content: e.target.value });
    if (editor) {
      editor.commands.setContent(e.target.value);
    }
  };

  const handleStaffMemberChange = (index: number, field: 'name' | 'title', value: string) => {
    const newStaffMembers = [...formData.staffMembers];
    newStaffMembers[index] = { ...newStaffMembers[index], [field]: value };
    setFormData({ ...formData, staffMembers: newStaffMembers });
  };

  const addStaffMember = () => {
    setFormData({
      ...formData,
      staffMembers: [...formData.staffMembers, { name: '', title: '', image: '' }]
    });
  };

  const removeStaffMember = (index: number) => {
    const newStaffMembers = formData.staffMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, staffMembers: newStaffMembers });
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
    <AdminLayout title="Director Desk Management">
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
        <form onSubmit={handleSubmit}>

          {/* Hero Section */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Hero Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Hero Title
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
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
                Hero Banner Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {formData.heroBannerImage && (
                <div style={{ marginTop: '8px' }}>
                  <Image
                    src={formData.heroBannerImage}
                    alt="Hero Banner Preview"
                    width={300}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Heading Section */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Main Heading
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Heading Text
              </label>
              <input
                type="text"
                value={formData.mainHeading}
                onChange={(e) => setFormData({ ...formData, mainHeading: e.target.value })}
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

          {/* Content Section with TipTap Editor */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Content Section
            </h3>

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
                
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'p') {
                      editor?.chain().focus().setParagraph().run();
                    } else {
                          const lvl = parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6;
                          editor?.chain().focus().toggleHeading({ level: lvl }).run();
                        }
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    backgroundColor: '#ffffff',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    height: '30px'
                  }}
                >
                  <option value="p">Normal</option>
                  <option value="1">Heading 1</option>
                  <option value="2">Heading 2</option>
                  <option value="3">Heading 3</option>
                  <option value="4">Heading 4</option>
                  <option value="5">Heading 5</option>
                  <option value="6">Heading 6</option>
                </select>
              </div>

              {/* Second Row */}
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  style={toolbarButtonStyle(editor?.isActive('bulletList'))}
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  style={toolbarButtonStyle(editor?.isActive('orderedList'))}
                >
                  1. List
                </button>
                
                <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
                
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'left' }))}
                >
                  ⬅️
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'center' }))}
                >
                  ⬌
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  style={toolbarButtonStyle(editor?.isActive({ textAlign: 'right' }))}
                >
                  ➡️
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
                  onClick={setLink}
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
            </div>

            {/* Editor or Source View */}
            {showSource ? (
              <textarea
                value={htmlContent}
                onChange={handleSourceChange}
                style={{
                  width: '100%',
                  minHeight: '400px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 6px 6px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                padding: '12px',
                backgroundColor: '#ffffff',
                minHeight: '400px'
              }}>
                <EditorContent editor={editor} />
              </div>
            )}

            {/* Character Count */}
            {editor && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'right'
              }}>
                {editor.storage.characterCount.characters()} characters
              </div>
            )}
          </div>

          {/* Staff Members Section */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Staff Members
            </h3>
            
            {formData.staffMembers.map((member, index) => (
              <div key={index} style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Staff Member {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeStaffMember(index)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Remove
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleStaffMemberChange(index, 'name', e.target.value)}
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
                      Title
                    </label>
                    <input
                      type="text"
                      value={member.title}
                      onChange={(e) => handleStaffMemberChange(index, 'title', e.target.value)}
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
                      Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStaffImageUpload(index)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {member.image && (
                      <div style={{ marginTop: '8px' }}>
                        <Image
                          src={member.image}
                          alt={`${member.name} preview`}
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addStaffMember}
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
              + Add Staff Member
            </button>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}