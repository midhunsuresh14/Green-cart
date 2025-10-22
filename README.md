# GreenCart - Herbal E-commerce Platform

GreenCart is a full-featured e-commerce platform for herbal products and remedies, built with a React frontend and Flask backend.

## Project Structure

- `/frontend` - React frontend application
- `/backend` - Flask backend API with MongoDB
- `/auth-app` - Authentication utilities

## Deployment Instructions

### Frontend Deployment

The frontend can be deployed to Render using the following steps:

1. Set the root directory to `/` in your Render project settings
2. Set the build command to `bash build.sh`
3. Set the publish directory to `frontend/build`
4. Add the required environment variables:
   - `REACT_APP_API_URL` - The URL of your backend API (e.g., https://your-backend-url.vercel.app/api)
5. The deployment will automatically use the `render.yaml` configuration file

### Backend Deployment

The backend can be deployed to Vercel using the following steps:

1. Set the root directory to `/backend` in your Vercel project settings
2. Add the required environment variables:
   - `MONGO_URI` - MongoDB connection string
   - `SECRET_KEY` - Secret key for JWT tokens
   - `EMAIL_USERNAME` - Email for sending OTPs
   - `EMAIL_PASSWORD` - Password for email account
3. The deployment will automatically use the `vercel.json` configuration file

## Environment Variables

Both frontend and backend require specific environment variables to function properly. Check the individual README files in each directory for detailed setup instructions.