# GreenCart - E-commerce Platform for Plants and Herbal Products

GreenCart is a full-featured e-commerce platform built with React/Next.js (frontend) and Flask (backend) for selling plants, herbal products, and gardening supplies.

## Features

- 🌱 Product catalog with categories and subcategories
- 🛒 Shopping cart and checkout system
- 👤 User authentication and profile management
- 🔐 Admin dashboard for product and order management
- 💬 Chatbot with AI-powered assistance
- 📝 Blog system for plant care tips and herbal remedies
- 📸 Image management with Cloudinary integration
- 📱 Responsive design with Tailwind CSS
- 🎨 Smooth animations with Framer Motion

## Cloudinary Integration

GreenCart now supports Cloudinary for image uploads! This allows for:

- Scalable image storage
- Automatic image optimization
- CDN delivery for faster loading
- No local storage requirements (perfect for Vercel deployment)

### Setup Instructions

1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Obtain your Cloudinary credentials
3. Create a `.env` file in the `backend` directory with your credentials:

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

4. Install the Cloudinary Python SDK:

```bash
cd backend
pip install cloudinary
```

For detailed setup instructions, see [README_CLOUDINARY.md](README_CLOUDINARY.md).

## Tech Stack

### Frontend
- React/Next.js
- Tailwind CSS
- Framer Motion
- Material-UI
- Firebase (authentication)

### Backend
- Flask (Python)
- MongoDB
- Redis (caching)
- Cloudinary (image storage)
- Razorpay (payments)
- Twilio (SMS)
- OpenAI/Mistral AI (chatbot)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.9 or higher)
- MongoDB
- Redis (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/greencart.git
cd greencart
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables (see `.env.example` files in both frontend and backend directories)

5. Start the development servers:
```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start frontend
cd frontend
npm start
```

## Deployment

The application can be deployed to Vercel (frontend) and Render (backend) with minimal configuration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.