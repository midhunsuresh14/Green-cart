# Frontend Deployment to Render

This document explains how to deploy the GreenCart frontend to Render.

## Prerequisites

1. A Render account
2. The backend deployed and running (on Vercel or elsewhere)
3. Environment variables configured in Render

## Deployment Steps

1. Push your code to a GitHub repository
2. Connect the repository to Render
3. Set the root directory to `/` in Render project settings
4. Set the build command to `bash build.sh`
5. Set the publish directory to `frontend/build`
6. Add the required environment variables in Render dashboard

## Required Environment Variables

- `REACT_APP_API_URL` - The URL of your backend API (e.g., https://your-backend-url.vercel.app/api)

## Build Process

The build process is defined in the `build.sh` script:
1. Navigate to the frontend directory
2. Install dependencies with `npm install`
3. Build the React app with `npm run build`

## Routing

The `render.yaml` file configures routing to serve the `index.html` file for all routes, which is necessary for React Router to work properly.

## Health Check

The frontend is a static site, so Render will automatically serve the files. There is no specific health check endpoint.