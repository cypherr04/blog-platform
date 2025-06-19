"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import styles
import 'react-quill/dist/quill.snow.css';

// Dynamic import with no SSR
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 border border-gray-300 rounded-md"></div>
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  if (!isMounted) {
    return <div className="h-64 w-full bg-gray-50 border border-gray-300 rounded-md"></div>;
  }
  
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder || "Write your content here..."}
      className={`h-64 w-full border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 `}
    />
  );
}
