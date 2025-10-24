/**
 * Utility functions for handling image uploads with Cloudinary
 */

/**
 * Convert a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string representation of the file
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Upload an image file to Cloudinary via backend
 * @param {File} file - The image file to upload
 * @param {Function} apiUploadFunction - The API upload function from api.js
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file, apiUploadFunction) => {
  try {
    console.log('Uploading image to Cloudinary:', file.name);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please select a JPEG, JPG, PNG, GIF, or WebP image.');
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Please select an image smaller than 5MB.');
    }
    
    // Upload the file
    const response = await apiUploadFunction(file);
    
    if (response.success) {
      console.log('Image uploaded successfully:', response.url);
      return response.url;
    } else {
      throw new Error(response.error || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Handle image selection and upload
 * @param {Event} event - The file input change event
 * @param {Function} apiUploadFunction - The API upload function from api.js
 * @param {Function} setPreviewUrl - State setter for preview URL
 * @param {Function} setUploadedUrl - State setter for uploaded URL
 * @returns {Promise<void>}
 */
export const handleImageUpload = async (event, apiUploadFunction, setPreviewUrl, setUploadedUrl) => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    
    // Set preview URL immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);
    
    // Upload the image
    const uploadedUrl = await uploadImage(file, apiUploadFunction);
    setUploadedUrl(uploadedUrl);
    
    console.log('Image uploaded and preview set');
  } catch (error) {
    console.error('Error handling image upload:', error);
    alert(`Upload failed: ${error.message}`);
    // Reset preview on error
    setPreviewUrl(null);
    setUploadedUrl(null);
  }
};

export default {
  fileToBase64,
  uploadImage,
  handleImageUpload
};