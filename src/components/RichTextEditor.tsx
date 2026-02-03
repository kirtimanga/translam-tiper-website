"use client";
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter content...', 
  minHeight = '300px' 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isInternalChange.current) {
      editorRef.current.innerHTML = value;
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleFormat = (e: React.MouseEvent, command: string, value?: string) => {
    e.preventDefault();
    handleCommand(command, value);
    editorRef.current?.focus();
  };

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px',
        borderBottom: '1px solid #d1d5db',
        backgroundColor: '#f9fafb',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'bold')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'italic')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontStyle: 'italic'
          }}
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'underline')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          U
        </button>
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'formatBlock', 'h1')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'formatBlock', 'h2')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'formatBlock', 'h3')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'formatBlock', 'p')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          P
        </button>
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'insertOrderedList')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          1. List
        </button>
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'justifyLeft')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          ⬅
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'justifyCenter')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          ⬌
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'justifyRight')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          ➡
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight,
          padding: '12px',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}