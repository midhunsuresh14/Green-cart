# GreenCart Backend

This is the Flask backend for the GreenCart application with MongoDB integration.

## Setup Instructions

1. **Install MongoDB**
   - Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud service)
   - Make sure MongoDB is running on `localhost:27017`

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure MongoDB**
   - The application will automatically create the `greencart` database and `users` collection
   - Default connection: `mongodb://localhost:27017/`

4. **Set Secret Key**
   - Update the `SECRET_KEY` in `app.py` with a secure secret key for JWT tokens

5. **Run the Backend**
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000`

## API Endpoints

- `POST /api/signup` - Create a new user account with name, email, phone, and password
- `POST /api/login` - Authenticate user and return JWT token
- `GET /api/user/<user_id>` - Get user data by user ID

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "hashed_string",
  "name": "string",
  "phone": "string",
  "created_at": "datetime",
  "role": "string"
}
```

## Security Features

- Password hashing using Werkzeug
- JWT token authentication
- Email validation
- Phone number validation 