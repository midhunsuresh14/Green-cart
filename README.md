# GreenCart - Herbal E-commerce Platform

GreenCart is a full-featured e-commerce platform for herbal products and remedies, built with a React frontend and Flask backend.

## Project Structure

- `/frontend` - React frontend application
- `/backend` - Flask backend API with MongoDB
- `/auth-app` - Authentication utilities

## Deployment Instructions

### Frontend Deployment

The frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

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