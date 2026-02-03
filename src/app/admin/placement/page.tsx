"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BASE_URL } from '@/utils/baseUrl';
import { usePlacement } from '@/contexts/PlacementContext';
import Image from 'next/image';
import styles from '@/styles/admin/Placement.module.css';
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
import '../admission/tiptap.css';

const PlacementAdmin = () => {
  const { data, updateData, addStudent, updateStudent, deleteStudent, addFeature, updateFeature, deleteFeature } = usePlacement();
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', company: '', image: '', order: 0, isActive: true });
  const [newFeature, setNewFeature] = useState({ title: '', description: '', order: 0 });
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [studentImages, setStudentImages] = useState<{ [key: string]: File }>({});
  const [activeTab, setActiveTab] = useState('hero');
  const [formData, setFormData] = useState(data);
  const [showSource, setShowSource] = useState({ description: false, content: false, training: false });
  const [htmlContent, setHtmlContent] = useState({ description: '', content: '', training: '' });

  // Editor for CRC Description
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
    content: formData.crcDescription || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setHtmlContent(prev => ({ ...prev, description: content }));
      setFormData(prev => ({ ...prev, crcDescription: content }));
    },
  });

  // Editor for CRC Content
  const contentEditor = useEditor({
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
    content: formData.crcContent || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setHtmlContent(prev => ({ ...prev, content: content }));
      setFormData(prev => ({ ...prev, crcContent: content }));
    },
  });

  // Editor for Training Description
  const trainingEditor = useEditor({
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
    content: formData.trainingDescription || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setHtmlContent(prev => ({ ...prev, training: content }));
      setFormData(prev => ({ ...prev, trainingDescription: content }));
    },
  });

  // Sync formData with context data when it changes
  React.useEffect(() => {
    setFormData(data);
    if (descriptionEditor && data.crcDescription) {
      descriptionEditor.commands.setContent(data.crcDescription);
      setHtmlContent(prev => ({ ...prev, description: data.crcDescription }));
    }
    if (contentEditor && data.crcContent) {
      contentEditor.commands.setContent(data.crcContent);
      setHtmlContent(prev => ({ ...prev, content: data.crcContent }));
    }
    if (trainingEditor && data.trainingDescription) {
      trainingEditor.commands.setContent(data.trainingDescription);
      setHtmlContent(prev => ({ ...prev, training: data.trainingDescription }));
    }
  }, [data, descriptionEditor, contentEditor, trainingEditor]);

  const handleHeroImageUpload = async (file: File) => {
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    
    try {
  const response = await fetch(`${BASE_URL}/api/placement/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (response.ok) {
        const result = await response.json();
        const updatedFormData = {
          ...formData,
          heroImage: `${BASE_URL}${result.url}`
        };
        setFormData(updatedFormData);
        await updateData(updatedFormData);
      }
    } catch (error) {
      console.error('Failed to upload hero image:', error);
      showAlert('error', 'Failed to upload hero image. Please try again.');
    }
  };

  const handleStudentImageUpload = async (file: File, studentId?: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    
    try {
  const response = await fetch(`${BASE_URL}/api/placement/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (response.ok) {
        const result = await response.json();
  const imagePath = `${BASE_URL}${result.url}`;
        
        if (studentId) {
          const student = (formData.students || []).find(s => s.id === studentId);
          if (student) {
            const updatedStudents = (formData.students || []).map(s => 
              s.id === studentId ? { ...s, image: imagePath } : s
            );
            const updatedFormData = { ...formData, students: updatedStudents };
            setFormData(updatedFormData);
            await updateData(updatedFormData);
            showAlert('success', 'Student image updated successfully!');
          }
        } else {
          setNewStudent({ ...newStudent, image: imagePath });
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Failed to upload student image:', error);
      showAlert('error', 'Failed to upload student image. Please try again.');
    }
  };

  const handleAddStudent = async () => {
    if (newStudent.name && newStudent.company) {
      await addStudent({
        ...newStudent,
        order: (formData.students || []).length
      });
      setNewStudent({ name: '', company: '', image: '', order: 0, isActive: true });
    }
  };

  const handleAddFeature = async () => {
    if (newFeature.title && newFeature.description) {
      await addFeature({
        ...newFeature,
        order: data.trainingFeatures.length
      });
      setNewFeature({ title: '', description: '', order: 0 });
    }
  };

  const handleSaveContent = async () => {
    try {
      await updateData(formData);
      showAlert('success', 'Content saved successfully!');
    } catch (error) {
      console.error('Failed to save content:', error);
      showAlert('error', 'Failed to save content. Please try again.');
    }
  };

  // Editor helper functions
  const handleSourceChange = (field: 'description' | 'content' | 'training', value: string) => {
    setHtmlContent(prev => ({ ...prev, [field]: value }));
  };

  const toggleSource = (field: 'description' | 'content' | 'training') => {
    const editor = field === 'description' ? descriptionEditor : 
                   field === 'content' ? contentEditor : trainingEditor;
    if (showSource[field] && editor) {
      editor.commands.setContent(htmlContent[field]);
    }
    setShowSource(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const addLink = (editor: ReturnType<typeof useEditor>) => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = (editor: ReturnType<typeof useEditor>) => {
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
    margin: '2px'
  });

  const renderToolbar = (editor: ReturnType<typeof useEditor>, field: 'description' | 'content' | 'training') => (
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
          onClick={() => toggleSource(field)}
          style={{
            ...toolbarButtonStyle(showSource[field]),
            minWidth: '70px'
          }}
        >
          {showSource[field] ? '📝 Editor' : '📄 Source'}
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
  );

  return (
    <AdminLayout title="Placement Management">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
      <div className={styles.container}>
        <h1 className={styles.title}>Placement Management</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'hero' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('hero')}
          >
            Hero Section
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'crc' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('crc')}
          >
            Corporate Resource Center
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'training' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('training')}
          >
            Training & Development
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'students' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Student Placements
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'hero' && (
            <div className={styles.section}>
              <h2>Hero Section</h2>
              <div className={styles.formGroup}>
                <label>Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle || ''}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Background Image</label>
                <div className={styles.imageUpload}>
                  {formData.heroImage && (
                    <div className={styles.imagePreview}>
                      <Image
                        src={formData.heroImage}
                        alt="Hero background"
                        width={300}
                        height={200}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setHeroImage(file);
                        handleHeroImageUpload(file);
                      }
                    }}
                    className={styles.fileInput}
                  />
                </div>
              </div>
              <button onClick={handleSaveContent} className={styles.saveButton}>
                Save Hero Section
              </button>
            </div>
          )}

          {activeTab === 'crc' && (
            <div className={styles.section}>
              <h2>Corporate Resource Center (CRC)</h2>
              <div className={styles.formGroup}>
                <label>Section Title</label>
                <input
                  type="text"
                  value={formData.crcTitle || ''}
                  onChange={(e) => setFormData({ ...formData, crcTitle: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Short Description</label>
                
                {descriptionEditor && renderToolbar(descriptionEditor, 'description')}
                
                {/* Editor Content / Source View */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '120px'
                }}>
                  {showSource.description ? (
                    <textarea
                      value={htmlContent.description}
                      onChange={(e) => handleSourceChange('description', e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '120px',
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
                        minHeight: '120px',
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
                  Words: {descriptionEditor?.storage.characterCount?.words() || 0}, Characters: {descriptionEditor?.storage.characterCount?.characters() || 0}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Detailed Content</label>
                
                {contentEditor && renderToolbar(contentEditor, 'content')}
                
                {/* Editor Content / Source View */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '300px'
                }}>
                  {showSource.content ? (
                    <textarea
                      value={htmlContent.content}
                      onChange={(e) => handleSourceChange('content', e.target.value)}
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
                      editor={contentEditor} 
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
                  Words: {contentEditor?.storage.characterCount?.words() || 0}, Characters: {contentEditor?.storage.characterCount?.characters() || 0}
                </div>
              </div>
              <button onClick={handleSaveContent} className={styles.saveButton}>
                Save CRC Section
              </button>
            </div>
          )}

          {activeTab === 'training' && (
            <div className={styles.section}>
              <h2>Training and Development</h2>
              <div className={styles.formGroup}>
                <label>Section Title</label>
                <input
                  type="text"
                  value={formData.trainingTitle || ''}
                  onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                
                {trainingEditor && renderToolbar(trainingEditor, 'training')}
                
                {/* Editor Content / Source View */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '150px'
                }}>
                  {showSource.training ? (
                    <textarea
                      value={htmlContent.training}
                      onChange={(e) => handleSourceChange('training', e.target.value)}
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
                      editor={trainingEditor} 
                      style={{
                        minHeight: '150px',
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
                  Words: {trainingEditor?.storage.characterCount?.words() || 0}, Characters: {trainingEditor?.storage.characterCount?.characters() || 0}
                </div>
              </div>

              <h3>Key Features</h3>
              <div className={styles.featuresList}>
                {(formData.trainingFeatures || []).map((feature) => (
                  <div key={feature.id} className={styles.featureItem}>
                    {editingFeature === feature.id ? (
                      <>
                        <input
                          type="text"
                          value={feature.title || ''}
                          onChange={(e) => {
                            const updated = (formData.trainingFeatures || []).map(f =>
                              f.id === feature.id ? { ...f, title: e.target.value } : f
                            );
                            setFormData({ ...formData, trainingFeatures: updated });
                          }}
                          className={styles.input}
                        />
                        <textarea
                          value={feature.description || ''}
                          onChange={(e) => {
                            const updated = (formData.trainingFeatures || []).map(f =>
                              f.id === feature.id ? { ...f, description: e.target.value } : f
                            );
                            setFormData({ ...formData, trainingFeatures: updated });
                          }}
                          className={styles.textarea}
                          rows={2}
                        />
                        <div className={styles.actions}>
                          <button
                            onClick={() => {
                              updateFeature(feature.id, feature);
                              setEditingFeature(null);
                            }}
                            className={styles.saveButton}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingFeature(null)}
                            className={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                        <div className={styles.actions}>
                          <button
                            onClick={() => setEditingFeature(feature.id)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFeature(feature.id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.addFeature}>
                <h4>Add New Feature</h4>
                <input
                  type="text"
                  placeholder="Feature Title"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  className={styles.input}
                />
                <textarea
                  placeholder="Feature Description"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className={styles.textarea}
                  rows={2}
                />
                <button onClick={handleAddFeature} className={styles.addButton}>
                  Add Feature
                </button>
              </div>
              <button onClick={handleSaveContent} className={styles.saveButton}>
                Save Training Section
              </button>
            </div>
          )}

          {activeTab === 'students' && (
            <div className={styles.section}>
              <h2>Student Placements</h2>
              
              <div className={styles.studentsGrid}>
                {(formData.students || []).map((student) => (
                  <div key={student.id} className={styles.studentCard}>
                    {editingStudent === student.id ? (
                      <>
                        <div className={styles.imageUpload}>
                          {student.image && (
                            <Image
                              src={student.image}
                              alt={student.name}
                              width={150}
                              height={150}
                              style={{ objectFit: 'cover' }}
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setStudentImages({ ...studentImages, [student.id]: file });
                                handleStudentImageUpload(file, student.id);
                              }
                            }}
                            className={styles.fileInput}
                          />
                        </div>
                        <input
                          type="text"
                          value={student.name || ''}
                          onChange={(e) => {
                            const updated = (formData.students || []).map(s =>
                              s.id === student.id ? { ...s, name: e.target.value } : s
                            );
                            setFormData({ ...formData, students: updated });
                          }}
                          className={styles.input}
                          placeholder="Student Name"
                        />
                        <input
                          type="text"
                          value={student.company || ''}
                          onChange={(e) => {
                            const updated = (formData.students || []).map(s =>
                              s.id === student.id ? { ...s, company: e.target.value } : s
                            );
                            setFormData({ ...formData, students: updated });
                          }}
                          className={styles.input}
                          placeholder="Company"
                        />
                        <div className={styles.checkboxGroup}>
                          <input
                            type="checkbox"
                            checked={student.isActive || false}
                            onChange={(e) => {
                              const updated = (formData.students || []).map(s =>
                                s.id === student.id ? { ...s, isActive: e.target.checked } : s
                              );
                              setFormData({ ...formData, students: updated });
                            }}
                            id={`active-${student.id}`}
                          />
                          <label htmlFor={`active-${student.id}`}>Active</label>
                        </div>
                        <div className={styles.actions}>
                          <button
                            onClick={() => {
                              updateStudent(student.id, student);
                              setEditingStudent(null);
                            }}
                            className={styles.saveButton}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStudent(null)}
                            className={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {student.image && (
                          <Image
                            src={student.image}
                            alt={student.name}
                            width={150}
                            height={150}
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                        <h4>{student.name}</h4>
                        <p>{student.company}</p>
                        <p className={student.isActive ? styles.active : styles.inactive}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </p>
                        <div className={styles.actions}>
                          <button
                            onClick={() => setEditingStudent(student.id)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                <div className={styles.studentCard}>
                  <h4>Add New Student</h4>
                  <div className={styles.imageUpload}>
                    {newStudent.image && (
                      <Image
                        src={newStudent.image}
                        alt="New student"
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleStudentImageUpload(file);
                        }
                      }}
                      className={styles.fileInput}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={newStudent.company}
                    onChange={(e) => setNewStudent({ ...newStudent, company: e.target.value })}
                    className={styles.input}
                  />
                  <button onClick={handleAddStudent} className={styles.addButton}>
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlacementAdmin;