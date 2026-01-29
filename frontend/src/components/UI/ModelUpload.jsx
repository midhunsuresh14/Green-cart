import React, { useState } from 'react';
import { uploadImage } from '../../lib/api'; // We can reuse the same API helper or create a new one
import { handleImageUpload } from '../../lib/imageUpload'; // We might need to adjust this or duplicate logic for models

const ModelUpload = ({
    onUpload,
    label = "Upload 3D Model (.glb)",
    value,
    setValue
}) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf') && !file.name.toLowerCase().endsWith('.usdz')) {
            alert('Please upload a .glb, .gltf, or .usdz file');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api'}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            if (data.success) {
                if (setValue) setValue(data.url);
                if (onUpload) onUpload(data.url);
            }
        } catch (error) {
            console.error('Model upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        if (setValue) setValue('');
        if (onUpload) onUpload('');
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {value ? (
                <div className="relative flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="material-icons text-green-600 mr-2">view_in_ar</span>
                    <span className="text-sm text-gray-600 truncate flex-1">{value.split('/').pop()}</span>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="ml-2 text-red-500 hover:text-red-700"
                        disabled={uploading}
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                        {uploading ? (
                            <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <span className="material-icons text-3xl mb-1">cloud_upload</span>
                                <span className="text-xs">Click to upload .glb file</span>
                            </div>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept=".glb,.gltf,.usdz"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default ModelUpload;
