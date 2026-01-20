# Plant Identification Module Setup

## Overview
The plant identification module allows users to upload a photo of a plant and get instant AI-powered identification using the PlantNet API.

## Features
- Upload plant photos (JPEG, PNG, etc.)
- Real-time plant identification using PlantNet API
- Display top 5 identification results with confidence scores
- Show scientific names, common names, genus, and family
- Responsive UI with loading states and error handling

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   The `requests` library is required for API calls.

2. **PlantNet API Key (REQUIRED)**
   
   The PlantNet API requires an API key for authentication. Without it, you'll get a 401 Unauthorized error.
   
   To get a free API key:
   - Visit [PlantNet API](https://my.plantnet.org/)
   - Sign up for a free account
   - Navigate to your dashboard
   - Generate an API key (it's free for basic usage)
   
   Add to your `.env` file in the `backend` directory:
   ```env
   PLANTNET_API_KEY=your_api_key_here
   ```
   
   **Important**: After adding the API key, restart your backend server for the changes to take effect.

3. **API Endpoint**
   The endpoint is available at: `POST /api/plant/identify`
   
   Request body:
   ```json
   {
     "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
   }
   ```
   
   Response:
   ```json
   {
     "success": true,
     "results": [
       {
         "scientificName": "Aloe vera",
         "scientificNameFull": "Aloe vera (L.) Burm.f.",
         "commonNames": ["Aloe vera", "Medicinal aloe"],
         "genus": "Aloe",
         "family": "Asphodelaceae",
         "confidence": 94.5,
         "score": 0.945
       }
     ],
     "bestMatch": { ... }
   }
   ```

### Frontend Setup

1. **Access the Feature**
   - Navigate to `/identify` route
   - Or click "Identify Plant" in the navigation menu

2. **Usage**
   - Click "Choose Photo" to select an image
   - Click "Identify Plant" to analyze
   - View results with scientific names, common names, and confidence scores

## API Details

### PlantNet API
- **Endpoint**: `https://my-api.plantnet.org/v2/identify/{project}`
- **Project Options**: 
  - `all` - All available plant databases (default)
  - `weurope` - Western Europe
  - `europe` - Europe
  - `usa` - United States
  - And more regional options

### Rate Limits
- Without API key: Limited requests per day
- With API key: Higher rate limits (check PlantNet documentation)

## Troubleshooting

### Common Issues

1. **"Missing authentication" or 401 Error**
   - **Most Common Issue**: The `PLANTNET_API_KEY` is not set in your `.env` file
   - Verify the API key is correctly set: `PLANTNET_API_KEY=your_actual_key_here`
   - Make sure there are no extra spaces or quotes around the key
   - Restart your backend server after adding the key
   - Verify the key is valid by checking your PlantNet dashboard

2. **"No plant species identified"**
   - Ensure the photo is clear and focused on the plant
   - Try different angles (leaves, flowers, bark)
   - Ensure good lighting
   - Make sure the plant is clearly visible in the image

3. **API Errors (500, 503, etc.)**
   - Check if PlantNet API is accessible (visit https://my-api.plantnet.org/)
   - Verify API key is correct and not expired
   - Check network connectivity
   - Check backend server logs for detailed error messages

4. **Image Upload Errors**
   - Ensure image is under 10MB
   - Supported formats: JPEG, PNG, GIF, WebP
   - Make sure the file is a valid image file

## Future Enhancements
- Save identification history
- Link identified plants to product catalog
- Show care instructions for identified plants
- Add location-based identification (GPS metadata)

