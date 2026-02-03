"use client";
import { useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import AdminLayout from '@/components/AdminLayout';
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
import './tiptap.css';

export default function AdmissionManagement() {
  const [bannerImage, setBannerImage] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
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
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  // Fetch existing admission data
  useEffect(() => {
    fetchAdmissionData();
  }, []);

  // Set editor content when editor is ready
  useEffect(() => {
    if (editor) {
      fetchAdmissionData();
    }
  }, [editor]);

  const fetchAdmissionData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admission`);
      if (response.ok) {
        const data = await response.json();
        if (data.bannerImage) {
          setBannerImage(data.bannerImage);
          setBannerPreview(`${BASE_URL}${data.bannerImage}`);
        } else {
          // Clear banner if no image
          setBannerImage('');
          setBannerPreview('');
        }
        if (data.content && editor) {
          editor.commands.setContent(data.content);
          setHtmlContent(data.content);
        }
      }
    } catch (error) {
      console.error('Error fetching admission data:', error);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const formData = new FormData();
    formData.append('banner', file);

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admission/banner`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
  setBannerImage(data.bannerImage);
  setBannerPreview(`${BASE_URL}${data.bannerImage}`);
        showAlert('success', 'Banner uploaded successfully!');
        setMessage('Banner uploaded successfully!');
        // Refresh admission data to ensure consistency
        setTimeout(() => fetchAdmissionData(), 500);
        setTimeout(() => setMessage(''), 3000);
      } else {
        showAlert('error', 'Failed to upload banner');
        setMessage('Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      showAlert('error', 'Error uploading banner');
      setMessage('Error uploading banner');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    try {
      setSaving(true);
      const contentToSave = showSource ? htmlContent : editor.getHTML();
      console.log('Saving content:', contentToSave);
      console.log('Banner image:', bannerImage);
      
      const response = await fetch(`${BASE_URL}/api/admission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToSave,
          bannerImage: bannerImage,
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        handleApiResponse(responseData);
        setMessage('Content saved successfully!');
        // Refresh admission data to show updated banner image
        fetchAdmissionData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        showAlert('error', `Failed to save content: ${responseData.error || 'Unknown error'}`);
        setMessage(`Failed to save content: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      if (error instanceof Error) {
        showAlert('error', `Error saving content: ${error.message}`);
        setMessage(`Error saving content: ${error.message}`);
      } else {
        showAlert('error', 'Error saving content');
        setMessage('Error saving content');
      }
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

  return (
    <AdminLayout title="Admission Management">
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
        {message && (
          <div style={{
            backgroundColor: message.includes('Error') || message.includes('Failed') ? '#FEE2E2' : '#D1FAE5',
            color: message.includes('Error') || message.includes('Failed') ? '#991B1B' : '#065F46',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        {/* Banner Upload Section */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
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
            {bannerPreview && (
              <div style={{ marginBottom: '16px' }}>
                <img 
                  src={bannerPreview} 
                  alt="Banner preview" 
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={loading}
              style={{ display: 'none' }}
              id="banner-upload"
            />
            <label htmlFor="banner-upload">
              <button
                onClick={() => document.getElementById('banner-upload')?.click()}
                disabled={loading}
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Uploading...' : 'Upload Banner Image'}
              </button>
            </label>
          </div>
        </div>

        {/* Rich Text Editor Section */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Admission Content
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
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                style={toolbarButtonStyle()}
              >
                ↶
              </button>
              <button
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                style={toolbarButtonStyle()}
              >
                ↷
              </button>
              
              <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
              
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                style={toolbarButtonStyle(editor?.isActive('bold'))}
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                style={toolbarButtonStyle(editor?.isActive('italic'))}
              >
                <em>I</em>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                style={toolbarButtonStyle(editor?.isActive('underline'))}
              >
                <u>U</u>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                style={toolbarButtonStyle(editor?.isActive('strike'))}
              >
                <s>S</s>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleSubscript().run()}
                style={toolbarButtonStyle(editor?.isActive('subscript'))}
              >
                X₂
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                style={toolbarButtonStyle(editor?.isActive('superscript'))}
              >
                X²
              </button>
              
              <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
              
              <button
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                style={toolbarButtonStyle(editor?.isActive({ textAlign: 'left' }))}
              >
                ≡
              </button>
              <button
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                style={toolbarButtonStyle(editor?.isActive({ textAlign: 'center' }))}
              >
                ≡
              </button>
              <button
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                style={toolbarButtonStyle(editor?.isActive({ textAlign: 'right' }))}
              >
                ≡
              </button>
              <button
                onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                style={toolbarButtonStyle(editor?.isActive({ textAlign: 'justify' }))}
              >
                ≡
              </button>
              
              <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
              
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                style={toolbarButtonStyle(editor?.isActive('bulletList'))}
              >
                •
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                style={toolbarButtonStyle(editor?.isActive('orderedList'))}
              >
                1.
              </button>
              
              <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
              
              <button
                onClick={addLink}
                style={toolbarButtonStyle(editor?.isActive('link'))}
              >
                🔗
              </button>
              <button
                onClick={addImage}
                style={toolbarButtonStyle()}
              >
                🖼️
              </button>
              <button
                onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                style={toolbarButtonStyle()}
              >
                ⊞
              </button>
              
              <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />
              
              <button
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                style={toolbarButtonStyle(editor?.isActive('codeBlock'))}
              >
                {'</>'}
              </button>
              <button
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
            minHeight: '400px'
          }}>
            {showSource ? (
              <textarea
                value={htmlContent}
                onChange={handleSourceChange}
                style={{
                  width: '100%',
                  minHeight: '400px',
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
                  minHeight: '400px',
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

          {/* Save Button */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {saving ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}