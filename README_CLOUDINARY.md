# Cloudinary Integration for GreenCart

This document explains how to set up and use Cloudinary for image uploads in the GreenCart project.

## Prerequisites

1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Obtain your Cloudinary credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Setup Instructions

### 1. Backend Configuration

Create a `.env` file in the `backend` directory with the following environment variables:

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### 2. Install Dependencies

Make sure you have the Cloudinary Python SDK installed:

```bash
pip install cloudinary
```

### 3. Verify Installation

You can verify that Cloudinary is properly installed by running:

```bash
python -c "import cloudinary; print('Cloudinary installed successfully')"
```

## How It Works

### Backend Implementation

The backend includes a new endpoint at `/api/cloudinary-upload` that:

1. Accepts a POST request with a base64-encoded image string
2. Uploads the image to Cloudinary in the "greencart_uploads" folder
3. Returns the secure URL of the uploaded image

### Frontend Implementation

The frontend includes:

1. An updated `uploadImage` function in `src/lib/api.js` that converts files to base64 and sends them to the backend
2. A reusable `ImageUpload` component at `src/components/UI/ImageUpload.jsx` for easy integration
3. Updated components like `AdminProducts` and `CreatePost` that use the new upload functionality

## Testing the Integration

You can test the Cloudinary integration by:

1. Starting the backend server: `python app.py`
2. Running the test script: `python test_cloudinary_upload.py`

## Troubleshooting

### Common Issues

1. **"Must supply api_key" Error**
   - Ensure your `.env` file is in the backend directory
   - Verify that the environment variables are named correctly:
     - `CLOUD_NAME`
     - `CLOUD_API_KEY`
     - `CLOUD_API_SECRET`

2. **"Invalid image format" Error**
   - Make sure you're sending a proper base64 data URI with the correct MIME type
   - Example: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...`

3. **401 Unauthorized Error**
   - This shouldn't happen with the new endpoint since it's public
   - If you see this, make sure you're using `/api/cloudinary-upload` and not `/api/upload`

### Environment Variables Not Loading

If your environment variables aren't being loaded:

1. Verify the `.env` file is in the correct location (`backend/.env`)
2. Make sure there are no extra spaces or characters in the file
3. Restart the backend server after making changes to the `.env` file

## Security Considerations

- All Cloudinary API keys are kept server-side, never exposed to the frontend
- File type validation is performed on the frontend
- Images are stored in a dedicated Cloudinary folder for organization
- The upload endpoint is public but only accepts properly formatted base64 image data

## Customization

### Changing the Upload Folder

To change the Cloudinary folder name, modify the `folder` parameter in the backend upload function in `app.py`:

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

## Components Using Cloudinary Upload

1. **AdminProducts** - For product images
2. **CreatePost** - For blog post images
3. **ImageUpload** - Reusable component for any image upload needs

## API Endpoints

- `POST /api/cloudinary-upload` - Upload a base64 image to Cloudinary

Example request body:
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

Example response:
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/greencart_uploads/image.png"
}
```