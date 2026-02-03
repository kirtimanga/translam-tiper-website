"use client";
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useAboutGroup } from '@/contexts/AboutGroupContext';
import { compressImage, getImageSizeInKB } from '@/utils/imageCompression';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import Image from 'next/image';
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

export default function AboutGroupManagement() {
  const { aboutGroupData, updateAboutGroupData } = useAboutGroup();
  const [formData, setFormData] = useState(aboutGroupData);
  const [isLoading, setIsLoading] = useState(false);
  const [showAboutUsSource, setShowAboutUsSource] = useState(false);
  const [showVisionSource, setShowVisionSource] = useState(false);
  const [showMissionSource, setShowMissionSource] = useState(false);
  const [aboutUsHtml, setAboutUsHtml] = useState('');
  const [visionHtml, setVisionHtml] = useState('');
  const [missionHtml, setMissionHtml] = useState('');
  const { alert, showAlert, hideAlert } = useAlert();

  // About US Editor
  const aboutUsEditor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      CodeBlock,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      CharacterCount,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setAboutUsHtml(editor.getHTML());
      setFormData(prev => ({ ...prev, aboutUsContent: editor.getHTML() }));
    },
  });

  // Vision Editor
  const visionEditor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      CodeBlock,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      CharacterCount,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setVisionHtml(editor.getHTML());
      setFormData(prev => ({ ...prev, visionContent: editor.getHTML() }));
    },
  });

  // Mission Editor
  const missionEditor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      CodeBlock,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      CharacterCount,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setMissionHtml(editor.getHTML());
      setFormData(prev => ({ ...prev, missionContent: editor.getHTML() }));
    },
  });

  // Update form data when context data changes
  useEffect(() => {
    setFormData(aboutGroupData);
    if (aboutUsEditor && aboutGroupData.aboutUsContent) {
      aboutUsEditor.commands.setContent(aboutGroupData.aboutUsContent);
      setAboutUsHtml(aboutGroupData.aboutUsContent);
    }
    if (visionEditor && aboutGroupData.visionContent) {
      visionEditor.commands.setContent(aboutGroupData.visionContent);
      setVisionHtml(aboutGroupData.visionContent);
    }
    if (missionEditor && aboutGroupData.missionContent) {
      missionEditor.commands.setContent(aboutGroupData.missionContent);
      setMissionHtml(aboutGroupData.missionContent);
    }
  }, [aboutGroupData, aboutUsEditor, visionEditor, missionEditor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log the data being saved for debugging
      console.log('Saving About Group data:', formData);
      
      // Check data size before saving
      const dataSize = new Blob([JSON.stringify(formData)]).size;
      console.log('Data size:', dataSize, 'bytes');
      
      // Update the context data
      await updateAboutGroupData(formData);
      console.log('Data successfully saved to backend');
      
      showAlert('success', 'About Group content updated successfully!');
    } catch (error) {
      console.error('Error saving About Group data:', error);
      showAlert('error', `Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (field: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          
          setFormData({ ...formData, [field]: finalImage });
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

  const handleAimsObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.aimsObjectives];
    newObjectives[index] = value;
    setFormData({ ...formData, aimsObjectives: newObjectives });
  };

  const addAimsObjective = () => {
    setFormData({
      ...formData,
      aimsObjectives: [...formData.aimsObjectives, '']
    });
  };

  const removeAimsObjective = (index: number) => {
    const newObjectives = formData.aimsObjectives.filter((_, i) => i !== index);
    setFormData({ ...formData, aimsObjectives: newObjectives });
  };

  // Toolbar button style
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

  // Helper functions for editors
  const addLink = (editor?: Editor | null) => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = (editor?: Editor | null) => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Toggle source view functions
  const toggleAboutUsSource = () => {
    if (showAboutUsSource && aboutUsEditor) {
      aboutUsEditor.commands.setContent(aboutUsHtml);
      setFormData(prev => ({ ...prev, aboutUsContent: aboutUsHtml }));
    }
    setShowAboutUsSource(!showAboutUsSource);
  };

  const toggleVisionSource = () => {
    if (showVisionSource && visionEditor) {
      visionEditor.commands.setContent(visionHtml);
      setFormData(prev => ({ ...prev, visionContent: visionHtml }));
    }
    setShowVisionSource(!showVisionSource);
  };

  const toggleMissionSource = () => {
    if (showMissionSource && missionEditor) {
      missionEditor.commands.setContent(missionHtml);
      setFormData(prev => ({ ...prev, missionContent: missionHtml }));
    }
    setShowMissionSource(!showMissionSource);
  };

  // Toolbar component
  const renderToolbar = (editor: Editor | null, showSource: boolean, toggleSource: () => void) => (
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
          onClick={() => addLink(editor)}
          style={toolbarButtonStyle(editor?.isActive('link'))}
        >
          🔗
        </button>
        <button
          onClick={() => addImage(editor)}
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
              const lvl = level as 1 | 2 | 3 | 4 | 5 | 6;
              editor?.chain().focus().toggleHeading({ level: lvl }).run();
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
    <AdminLayout title="About Group Management">
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
                onChange={handleImageUpload('heroBannerImage')}
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

          {/* About US Section */}
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
              About US Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Building Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload('buildingImage')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {formData.buildingImage && (
                <div style={{ marginTop: '8px' }}>
                  <Image
                    src={formData.buildingImage}
                    alt="Building Preview"
                    width={300}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                About US Title
              </label>
              <input
                type="text"
                value={formData.aboutUsTitle}
                onChange={(e) => setFormData({ ...formData, aboutUsTitle: e.target.value })}
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
                About US Content
              </label>
              
              {/* Toolbar */}
              {renderToolbar(aboutUsEditor, showAboutUsSource, toggleAboutUsSource)}

              {/* Editor Content / Source View */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '0 0 6px 6px',
                minHeight: '300px'
              }}>
                {showAboutUsSource ? (
                  <textarea
                    value={aboutUsHtml}
                    onChange={(e) => {
                      setAboutUsHtml(e.target.value);
                      setFormData(prev => ({ ...prev, aboutUsContent: e.target.value }));
                    }}
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
                    editor={aboutUsEditor} 
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
                Words: {aboutUsEditor?.storage.characterCount?.words() || 0}, Characters: {aboutUsEditor?.storage.characterCount?.characters() || 0}
              </div>
            </div>
          </div>

          {/* Vision & Mission Section */}
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
              Vision & Mission Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Vision & Mission Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload('visionImage')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {formData.visionImage && (
                <div style={{ marginTop: '8px' }}>
                  <Image
                    src={formData.visionImage}
                    alt="Vision Preview"
                    width={300}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Vision & Mission Title
              </label>
              <input
                type="text"
                value={formData.visionTitle}
                onChange={(e) => setFormData({ ...formData, visionTitle: e.target.value })}
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
                Vision Content
              </label>
              
              {/* Toolbar */}
              {renderToolbar(visionEditor, showVisionSource, toggleVisionSource)}

              {/* Editor Content / Source View */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '0 0 6px 6px',
                minHeight: '200px'
              }}>
                {showVisionSource ? (
                  <textarea
                    value={visionHtml}
                    onChange={(e) => {
                      setVisionHtml(e.target.value);
                      setFormData(prev => ({ ...prev, visionContent: e.target.value }));
                    }}
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
                    editor={visionEditor} 
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
                Words: {visionEditor?.storage.characterCount?.words() || 0}, Characters: {visionEditor?.storage.characterCount?.characters() || 0}
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
                Mission Content
              </label>
              
              {/* Toolbar */}
              {renderToolbar(missionEditor, showMissionSource, toggleMissionSource)}

              {/* Editor Content / Source View */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '0 0 6px 6px',
                minHeight: '200px'
              }}>
                {showMissionSource ? (
                  <textarea
                    value={missionHtml}
                    onChange={(e) => {
                      setMissionHtml(e.target.value);
                      setFormData(prev => ({ ...prev, missionContent: e.target.value }));
                    }}
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
                    editor={missionEditor} 
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
                Words: {missionEditor?.storage.characterCount?.words() || 0}, Characters: {missionEditor?.storage.characterCount?.characters() || 0}
              </div>
            </div>
          </div>

          {/* Aims & Objectives Section */}
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
              Aims & Objectives Section
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Aims & Objectives Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload('aimsImage')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {formData.aimsImage && (
                <div style={{ marginTop: '8px' }}>
                  <Image
                    src={formData.aimsImage}
                    alt="Aims Preview"
                    width={300}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Aims & Objectives Title
              </label>
              <input
                type="text"
                value={formData.aimsTitle}
                onChange={(e) => setFormData({ ...formData, aimsTitle: e.target.value })}
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
                marginBottom: '8px'
              }}>
                Objectives List
              </label>
              {formData.aimsObjectives.map((objective, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <textarea
                    value={objective}
                    onChange={(e) => handleAimsObjectiveChange(index, e.target.value)}
                    rows={2}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    placeholder={`Objective ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeAimsObjective(index)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAimsObjective}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  marginTop: '8px'
                }}
              >
                + Add Objective
              </button>
            </div>
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