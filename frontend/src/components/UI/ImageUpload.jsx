import React, { useState } from 'react';
import { uploadImage } from '../../lib/api';
import { handleImageUpload } from '../../lib/imageUpload';

const ImageUpload = ({ 
  onImageUpload, 
  label = "Upload Image",
  previewUrl,
  setPreviewUrl
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    setUploading(true);
    try {
      await handleImageUpload(
        e, 
        uploadImage, 
        setPreviewUrl || (() => {}), 
        onImageUpload
      );
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (setPreviewUrl) setPreviewUrl(null);
    if (onImageUpload) onImageUpload(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            disabled={uploading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400">
          <label className="cursor-pointer w-full h-full flex items-center justify-center">
            {uploading ? (
              <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}
      
      {uploading && (
        <p className="text-sm text-gray-500">Uploading image...</p>
      )}
    </div>
  );
};

export default ImageUpload;