# Cloudinary Integration Setup Guide

This guide explains how to set up Cloudinary for image uploads in the GreenCart project.

## Prerequisites

1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Obtain your Cloudinary credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Backend Setup

### 1. Install Dependencies

Install the Cloudinary Node.js SDK:

```bash
cd backend
pip install cloudinary
```

Or if you're using a requirements.txt file, ensure it includes:

```
cloudinary==1.41.0
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

### 3. API Endpoint

The backend now includes a `/api/upload` endpoint that:

- Accepts a POST request with a base64 image string
- Uploads the image to Cloudinary in the "greencart_uploads" folder
- Returns the secure URL of the uploaded image

## Frontend Integration

### 1. Image Upload Utility

The frontend includes utility functions in `src/lib/imageUpload.js`:

- `fileToBase64`: Converts a file to base64 string
- `uploadImage`: Uploads an image to Cloudinary via the backend
- `handleImageUpload`: Handles the complete image selection and upload process

### 2. Reusable ImageUpload Component

A reusable `ImageUpload` component is available at `src/components/UI/ImageUpload.jsx` that provides:

- Drag and drop or click to select image
- Image preview
- Upload progress indication
- Error handling
- Remove image functionality

### 3. Usage Examples

#### In Forms

```jsx
import ImageUpload from '../UI/ImageUpload';

const [imagePreview, setImagePreview] = useState(null);
const [imageUrl, setImageUrl] = useState('');

<ImageUpload 
  onImageUpload={setImageUrl}
  label="Product Image"
  previewUrl={imagePreview}
  setPreviewUrl={setImagePreview}
/>
```

## How It Works

1. User selects an image file
2. Frontend converts the file to base64
3. Base64 string is sent to the backend `/api/upload` endpoint
4. Backend uploads the image to Cloudinary
5. Cloudinary returns a secure URL for the uploaded image
6. Backend returns the URL to the frontend
7. Frontend uses the URL for display and saves it to the database

## Security Considerations

- All uploads are handled server-side to protect API keys
- File type and size validation is performed
- Images are stored in a dedicated Cloudinary folder
- Only authenticated users can upload images (where applicable)

## Troubleshooting

### Common Issues

1. **Upload fails with "Invalid file type"**
   - Ensure the file is a valid image (JPEG, PNG, GIF, WebP)
   - Check file size limits (max 5MB in frontend validation)

2. **Environment variables not loading**
   - Verify the `.env` file is in the backend directory
   - Ensure variable names match exactly (CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET)

3. **Cloudinary configuration errors**
   - Double-check your Cloudinary credentials
   - Ensure your Cloudinary account is active

### Testing the Upload Endpoint

You can test the upload endpoint with curl:

```bash
# First, convert an image to base64
base64 -i test-image.jpg -o image.b64

# Then send the request
curl -X POST http://localhost:5000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/..."}'
```

## Customization

### Changing the Upload Folder

To change the Cloudinary folder name, modify the `folder` parameter in the backend upload function:

```python
upload_result = cloudinary.uploader.upload(
    image_data,
    folder="your_custom_folder",  # Change this
    use_filename=True,
    unique_filename=False
)
```

### Adjusting File Size Limits

To change the file size limit, modify the validation in `src/lib/imageUpload.js`:

```javascript
// Validate file size (max 5MB)
const maxSize = 5 * 1024 * 1024; // Change this value
```