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

## SMS (Twilio) Configuration

Phone OTP endpoints are available but require Twilio credentials to send messages.

1. Create/Update `.env` in `backend/`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15551234567
# Optional: set a default country code for local numbers (e.g., 1 for US/CA)
DEFAULT_COUNTRY_CODE=1
```

2. Install dependencies (already listed):

```bash
pip install -r requirements.txt
```

3. Test your credentials by sending a message:

```bash
cd backend
python test_sms.py "+15551234567" "Hello from GreenCart"
```

4. Request an OTP via API (for an existing user phone):

```bash
curl -X POST http://localhost:5000/api/phone/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+15551234567"}'
```

5. Verify the OTP you receive:

```bash
curl -X POST http://localhost:5000/api/phone/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+15551234567", "otp": "123456"}'
```

See `SMS_SETUP.md` for details and troubleshooting.