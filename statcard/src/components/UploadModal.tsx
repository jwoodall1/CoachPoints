'use client'; // Required for Next.js App Router since this uses React state

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadModal({ isOpen, onClose, onUpload }) {
  // useCallback ensures the function isn't recreated on every render
  const onDrop = useCallback((acceptedFiles) => {
    // We only want the first file since it's a profile picture
    const file = acceptedFiles[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1, // Restrict to a single file
  });

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2">Upload Profile Photo</h2>
        <p className="text-gray-500 text-sm mb-6">Select an image from your device to update your StatCard.</p>

        {/* The Dropzone Area */}
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              {/* Simple Upload Icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the image here...</p>
            ) : (
              <p className="text-gray-600 font-medium">
                Drag & drop an image here, or <span className="text-blue-600">click to browse</span>
              </p>
            )}
            <p className="text-xs text-gray-400">Supports JPG, PNG, and WebP</p>
          </div>
        </div>

      </div>
    </div>
  );
}