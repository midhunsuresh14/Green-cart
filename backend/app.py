from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
import datetime
import os
import random
import string
from bson import ObjectId
from functools import wraps
from dotenv import load_dotenv
try:
    import razorpay
except Exception:
    razorpay = None
try:
    from twilio.rest import Client as TwilioClient
except Exception:
    TwilioClient = None

# Load environment variables
# Ensure we load the .env that sits next to this file regardless of current working directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('EMAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = (os.getenv('EMAIL_FROM_NAME', 'GreenCart'), os.getenv('EMAIL_USERNAME'))

mail = Mail(app)

# File uploads (local dev) - serve from /uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.tif', '.tiff', '.svg', '.jfif', '.pjpeg', '.pjp', '.heic', '.heif'}

# MongoDB Configuration (env override supported)
MONGO_URI = os.getenv('MONGO_URI', "mongodb://localhost:27017/")
DB_NAME = os.getenv('DB_NAME', "greencart")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db.users
products_collection = db.products
orders_collection = db.orders
remedies_collection = db.remedies
otp_collection = db.otp_verifications

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'greencart-secret-key-2024-secure-jwt-token')

# OTP Configuration
OTP_LENGTH = int(os.getenv('OTP_LENGTH', 6))
OTP_EXPIRY_MINUTES = int(os.getenv('OTP_EXPIRY_MINUTES', 10))

# Twilio configuration (for SMS OTP)
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER')
DEFAULT_COUNTRY_CODE = os.getenv('DEFAULT_COUNTRY_CODE', '').lstrip('+')

# Razorpay configuration
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
razorpay_client = None
if razorpay and RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    try:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception:
        razorpay_client = None

# OTP Helper Functions
def generate_otp():
    """Generate a random OTP of specified length"""
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))

def send_otp_email(email, otp, name):
    """Send OTP verification email"""
    try:
        msg = Message(
            subject='Verify Your Email - GreenCart',
            recipients=[email],
            html=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">GreenCart</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-bottom: 20px;">Welcome to GreenCart, {name}!</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Thank you for signing up! To complete your registration, please verify your email address using the OTP below:
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #4CAF50;">
                        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; margin: 0;">{otp}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This OTP will expire in {OTP_EXPIRY_MINUTES} minutes. If you didn't create an account with GreenCart, please ignore this email.
                    </p>
                </div>
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #ccc; margin: 0; font-size: 12px;">
                        © 2024 GreenCart. All rights reserved.
                    </p>
                </div>
            </div>
            '''
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def send_password_reset_email(email, code, name):
    """Send password reset verification code email"""
    try:
        msg = Message(
            subject='Reset Your Password - GreenCart',
            recipients=[email],
            html=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">GreenCart</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Hi {name or 'there'}, use the verification code below to reset your password:
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #4CAF50;">
                        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; margin: 0;">{code}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This code will expire in {OTP_EXPIRY_MINUTES} minutes. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #ccc; margin: 0; font-size: 12px;">
                        © 2024 GreenCart. All rights reserved.
                    </p>
                </div>
            </div>
            '''
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending reset email: {str(e)}")
        return False

def store_otp(email, otp):
    """Store OTP in database with expiry"""
    expiry_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)
    
    # Remove any existing OTP for this email
    otp_collection.delete_many({'email': email})
    
    # Store new OTP
    otp_doc = {
        'email': email,
        'otp': otp,
        'expires_at': expiry_time,
        'created_at': datetime.datetime.utcnow(),
        'used': False
    }
    otp_collection.insert_one(otp_doc)
    return True

def verify_otp(email, otp):
    """Verify OTP and mark as used"""
    otp_doc = otp_collection.find_one({
        'email': email,
        'otp': otp,
        'used': False,
        'expires_at': {'$gt': datetime.datetime.utcnow()}
    })
    
    if otp_doc:
        # Mark OTP as used
        otp_collection.update_one(
            {'_id': otp_doc['_id']},
            {'$set': {'used': True, 'verified_at': datetime.datetime.utcnow()}}
        )
        return True
    return False

# Password reset helpers (use same collection with discriminator to avoid collisions)
def store_password_reset_code(email, code):
    expiry_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp_collection.delete_many({'email': email, 'type': 'password_reset'})
    otp_doc = {
        'email': email,
        'otp': code,
        'type': 'password_reset',
        'expires_at': expiry_time,
        'created_at': datetime.datetime.utcnow(),
        'used': False
    }
    otp_collection.insert_one(otp_doc)
    return True

def verify_password_reset_code(email, code):
    otp_doc = otp_collection.find_one({
        'email': email,
        'otp': code,
        'type': 'password_reset',
        'used': False,
        'expires_at': {'$gt': datetime.datetime.utcnow()}
    })
    if otp_doc:
        otp_collection.update_one({'_id': otp_doc['_id']}, {'$set': {'used': True, 'verified_at': datetime.datetime.utcnow()}})
        return True
    return False

# Phone OTP helpers (separate docs to avoid collisions with email OTPs)
def store_phone_otp(phone, otp):
    """Store OTP for phone verification with expiry"""
    expiry_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp_collection.delete_many({'phone': phone})
    otp_doc = {
        'phone': phone,
        'otp': otp,
        'expires_at': expiry_time,
        'created_at': datetime.datetime.utcnow(),
        'used': False
    }
    otp_collection.insert_one(otp_doc)
    return True

def verify_phone_otp(phone, otp):
    """Verify phone OTP and mark as used"""
    otp_doc = otp_collection.find_one({
        'phone': phone,
        'otp': otp,
        'used': False,
        'expires_at': {'$gt': datetime.datetime.utcnow()}
    })
    if otp_doc:
        otp_collection.update_one({'_id': otp_doc['_id']}, {'$set': {'used': True, 'verified_at': datetime.datetime.utcnow()}})
        return True
    return False

# Auth helpers

def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ', 1)[1]
    try:
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded.get('user_id')
        if not user_id:
            return None
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        return user
    except Exception:
        return None


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        if user.get('role') != 'admin':
            return jsonify({'success': False, 'error': 'Forbidden: Admins only'}), 403
        return f(*args, **kwargs)
    return wrapper

@app.route('/')
def home():
    return 'GreenCart Flask Backend Running!'

@app.route('/api/db-status')
def db_status():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        
        # Get database stats
        db_stats = db.command("dbstats")
        user_count = users_collection.count_documents({})
        
        return jsonify({
            'success': True,
            'message': 'MongoDB connection successful',
            'database': DB_NAME,
            'connection_uri': MONGO_URI,
            'user_count': user_count,
            'database_size': f"{db_stats.get('dataSize', 0) / 1024:.2f} KB",
            'collections': db.list_collection_names()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'MongoDB connection failed: {str(e)}',
            'database': DB_NAME,
            'connection_uri': MONGO_URI
        }), 500

@app.route('/api/users')
@admin_required
def get_users():
    try:
        users = list(users_collection.find({}, {'password': 0}))  # Exclude passwords
        
        # Normalize shape for frontend
        normalized = []
        for user in users:
            normalized.append({
                'id': str(user['_id']),
                'name': user.get('name'),
                'email': user.get('email'),
                'phone': user.get('phone'),
                'role': user.get('role', 'user'),
                'active': user.get('active', True),
                'created_at': user.get('created_at')
            })
        
        return jsonify(normalized)
    except Exception as e:
        return jsonify({'error': f'Error fetching users: {str(e)}'}), 500

# Admin: delete user
@app.route('/api/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        users_collection.delete_one({'_id': ObjectId(user_id)})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/google-auth', methods=['POST'])
def google_auth():
    try:
        data = request.get_json()
        uid = data.get('uid')
        email = data.get('email')
        name = data.get('name')
        phone = data.get('phone', '')
        photo_url = data.get('photoURL', '')
        
        if not uid or not email or not name:
            return jsonify({
                'success': False,
                'error': 'Missing required Google authentication data'
            }), 400
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        
        if existing_user:
            # User exists, update their info and return login token
            users_collection.update_one(
                {'email': email},
                {
                    '$set': {
                        'google_uid': uid,
                        'name': name,
                        'phone': phone or existing_user.get('phone', ''),
                        'photo_url': photo_url,
                        'last_login': datetime.datetime.utcnow()
                    }
                }
            )
            
            user_data = {
                'id': str(existing_user['_id']),
                'email': email,
                'name': name,
                'phone': phone or existing_user.get('phone', ''),
                'role': existing_user.get('role', 'user'),
                'photo_url': photo_url
            }
        else:
            # Create new user
            user_doc = {
                'google_uid': uid,
                'email': email,
                'name': name,
                'phone': phone,
                'photo_url': photo_url,
                'created_at': datetime.datetime.utcnow(),
                'last_login': datetime.datetime.utcnow(),
                'role': 'user'
            }
            
            result = users_collection.insert_one(user_doc)
            
            user_data = {
                'id': str(result.inserted_id),
                'email': email,
                'name': name,
                'phone': phone,
                'role': 'user',
                'photo_url': photo_url
            }
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_data['id'],
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'Google authentication successful',
            'user': user_data,
            'token': token
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Google authentication failed: {str(e)}'
        }), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User with this email already exists'
            }), 400
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP in database
        store_otp(email, otp)
        
        # Send OTP email
        email_sent = send_otp_email(email, otp, name)
        
        if not email_sent:
            return jsonify({
                'success': False,
                'error': 'Failed to send verification email. Please try again.'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Verification email sent. Please check your inbox and enter the OTP to complete registration.',
            'email': email
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp_endpoint():
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        
        if not email or not otp or not password or not name:
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # Verify OTP
        if not verify_otp(email, otp):
            return jsonify({
                'success': False,
                'error': 'Invalid or expired OTP. Please request a new one.'
            }), 400
        
        # Check if user already exists (double check)
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User with this email already exists'
            }), 400
        
        # Hash the password
        hashed_password = generate_password_hash(password)
        
        # Create user document
        user_data = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'phone': phone,
            'email_verified': True,
            'created_at': datetime.datetime.utcnow(),
            'role': 'user'
        }
        
        # Insert user into MongoDB
        result = users_collection.insert_one(user_data)
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(result.inserted_id),
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'Account created and verified successfully',
            'user_id': str(result.inserted_id),
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User with this email already exists'
            }), 400
        
        # Generate new OTP
        otp = generate_otp()
        
        # Store OTP in database
        store_otp(email, otp)
        
        # Send OTP email
        email_sent = send_otp_email(email, otp, name or 'User')
        
        if not email_sent:
            return jsonify({
                'success': False,
                'error': 'Failed to send verification email. Please try again.'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'New verification email sent. Please check your inbox.'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

# Password reset: request code
@app.route('/api/password/request-reset', methods=['POST'])
def password_request_reset():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        if not email:
            return jsonify({'success': False, 'error': 'Email is required'}), 400

        user = users_collection.find_one({'email': email})
        # Always respond success to avoid email enumeration, but only send code if user exists
        if user:
            code = generate_otp()
            store_password_reset_code(email, code)
            send_password_reset_email(email, code, user.get('name', ''))

        return jsonify({'success': True, 'message': 'If an account exists, a reset code has been sent.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# Password reset: verify code and set new password
@app.route('/api/password/reset', methods=['POST'])
def password_reset():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        code = (data.get('code') or '').strip()
        new_password = data.get('newPassword') or ''

        if not email or not code or not new_password:
            return jsonify({'success': False, 'error': 'Email, code, and new password are required'}), 400

        if len(new_password) < 6:
            return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

        if not verify_password_reset_code(email, code):
            return jsonify({'success': False, 'error': 'Invalid or expired code'}), 400

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        hashed = generate_password_hash(new_password)
        users_collection.update_one({'_id': user['_id']}, {'$set': {'password': hashed}})

        return jsonify({'success': True, 'message': 'Password has been reset. You can now log in.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Find user by email
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Check password
        if not check_password_hash(user['password'], password):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'name': user['name'],
                'phone': user['phone'],
                'role': user.get('role', 'user')
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

# Login with phone number only (must be an existing registered user)
@app.route('/api/login-phone', methods=['POST'])
def login_phone():
    try:
        data = request.get_json()
        phone = (data or {}).get('phone', '').strip()

        if not phone:
            return jsonify({'success': False, 'error': 'Phone number is required'}), 400

        # Normalize phone: keep digits only for basic comparison
        digits_only = ''.join(ch for ch in phone if ch.isdigit())
        if not digits_only:
            return jsonify({'success': False, 'error': 'Invalid phone number'}), 400

        # Try to match either exact stored phone or digits-only match
        user = users_collection.find_one({
            '$or': [
                {'phone': phone},
                {'phone': digits_only}
            ]
        })

        if not user:
            return jsonify({'success': False, 'error': 'Phone number not found'}), 404

        # Optional: block inactive users if schema uses 'active'
        if user.get('active') is False:
            return jsonify({'success': False, 'error': 'Account is inactive'}), 403

        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user.get('email', ''),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': str(user['_id']),
                'email': user.get('email', ''),
                'name': user.get('name', ''),
                'phone': user.get('phone', ''),
                'role': user.get('role', 'user')
            },
            'token': token
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# Phone OTP: request
@app.route('/api/phone/request-otp', methods=['POST'])
def request_phone_otp():
    try:
        data = request.get_json() or {}
        phone_raw = (data.get('phone') or '').strip()
        if not phone_raw:
            return jsonify({'success': False, 'error': 'Phone number is required'}), 400

        digits_only = ''.join(ch for ch in phone_raw if ch.isdigit())
        if not digits_only:
            return jsonify({'success': False, 'error': 'Invalid phone number'}), 400

        # Find existing user by phone
        user = users_collection.find_one({
            '$or': [
                {'phone': phone_raw},
                {'phone': digits_only}
            ]
        })
        if not user:
            return jsonify({'success': False, 'error': 'Phone number not found'}), 404

        otp = generate_otp()
        # Prefer storing normalized digits_only
        store_phone_otp(digits_only, otp)

        # Send via Twilio (SMS or WhatsApp)
        if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER and TwilioClient is not None):
            return jsonify({'success': False, 'error': 'Messaging service not configured'}), 500

        try:
            twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            # Ensure E.164 format
            if phone_raw.startswith('+'):
                to_number = phone_raw
            elif DEFAULT_COUNTRY_CODE:
                # Remove leading zeros when combining with country code
                to_number = f"+{DEFAULT_COUNTRY_CODE}{digits_only.lstrip('0')}"
            else:
                return jsonify({'success': False, 'error': 'Phone must include country code, e.g., +15551234567'}), 400

            message_body = f"Your GreenCart OTP is {otp}. It expires in {OTP_EXPIRY_MINUTES} minutes."

            from_number = TWILIO_FROM_NUMBER
            to_param = to_number
            # If using WhatsApp sandbox/number, prefix both with 'whatsapp:'
            if str(from_number).startswith('whatsapp:'):
                to_param = f"whatsapp:{to_number}"

            twilio_client.messages.create(
                body=message_body,
                from_=from_number,
                to=to_param
            )
        except Exception as sms_err:
            # Best-effort cleanup: allow client to retry
            return jsonify({'success': False, 'error': f'Failed to send message: {str(sms_err)}'}), 500

        return jsonify({'success': True, 'message': 'OTP sent via SMS'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# Phone OTP: verify and login
@app.route('/api/phone/verify-otp', methods=['POST'])
def verify_phone_otp_endpoint():
    try:
        data = request.get_json() or {}
        phone_raw = (data.get('phone') or '').strip()
        otp = (data.get('otp') or '').strip()
        if not phone_raw or not otp:
            return jsonify({'success': False, 'error': 'Phone and OTP are required'}), 400

        digits_only = ''.join(ch for ch in phone_raw if ch.isdigit())
        if not digits_only:
            return jsonify({'success': False, 'error': 'Invalid phone number'}), 400

        if not verify_phone_otp(digits_only, otp):
            return jsonify({'success': False, 'error': 'Invalid or expired OTP'}), 400

        # Fetch user again and issue token
        user = users_collection.find_one({
            '$or': [
                {'phone': phone_raw},
                {'phone': digits_only}
            ]
        })
        if not user:
            return jsonify({'success': False, 'error': 'User not found for this phone'}), 404

        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user.get('email', ''),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'success': True,
            'message': 'Phone verified and login successful',
            'user': {
                'id': str(user['_id']),
                'email': user.get('email', ''),
                'name': user.get('name', ''),
                'phone': user.get('phone', ''),
                'role': user.get('role', 'user')
            },
            'token': token
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/user/<user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if user:
            return jsonify({
                'id': str(user['_id']),
                'email': user['email'],
                'name': user.get('name'),
                'phone': user.get('phone'),
                'role': user.get('role', 'user'),
                'active': user.get('active', True),
                'created_at': user.get('created_at')
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Admin: update user role
@app.route('/api/users/<user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    try:
        data = request.get_json()
        role = data.get('role')
        # Allowed roles for admin panel
        if role not in ['customer', 'seller', 'admin', 'user', 'staff']:
            return jsonify({'error': 'Invalid role'}), 400
        users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': {'role': role}})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Admin: toggle user active status
@app.route('/api/users/<user_id>/active', methods=['PUT'])
@admin_required
def toggle_user_active(user_id):
    try:
        data = request.get_json()
        active = bool(data.get('active', True))
        users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': {'active': active}})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Products CRUD (Admin)
@app.route('/api/admin/products', methods=['GET'])
@admin_required
def admin_list_products():
    try:
        q = request.args.get('q', '').strip().lower()
        items = []
        for p in products_collection.find():
            doc = {
                'id': str(p['_id']),
                'name': p.get('name'),
                'category': p.get('category'),
                'subcategory': p.get('subcategory', ''),
                'price': float(p.get('price', 0)),
                'description': p.get('description', ''),
                'stock': int(p.get('stock', 0)),
                'imageUrl': p.get('imageUrl', ''),
            }
            if not q or q in (doc['name'] or '').lower() or q in (doc['category'] or '').lower() or q in (doc['subcategory'] or '').lower():
                items.append(doc)
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/products', methods=['POST'])
@admin_required
def admin_create_product():
    try:
        data = request.get_json()
        doc = {
            'name': data.get('name'),
            'category': data.get('category'),
            'subcategory': data.get('subcategory', ''),
            'price': float(data.get('price', 0)),
            'description': data.get('description', ''),
            'stock': int(data.get('stock', 0)),
            'imageUrl': data.get('imageUrl', ''),
            'created_at': datetime.datetime.utcnow(),
        }
        # validations
        if not doc['name'] or not doc['category'] or doc['price'] <= 0 or doc['stock'] < 0:
            return jsonify({'error': 'Validation failed'}), 400
        res = products_collection.insert_one(doc)
        return jsonify({'id': str(res.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/products/<product_id>', methods=['PUT'])
@admin_required
def admin_update_product(product_id):
    try:
        data = request.get_json()
        update = {
            'name': data.get('name'),
            'category': data.get('category'),
            'subcategory': data.get('subcategory', ''),
            'price': float(data.get('price', 0)),
            'description': data.get('description', ''),
            'stock': int(data.get('stock', 0)),
            'imageUrl': data.get('imageUrl', ''),
        }
        if not update['name'] or not update['category'] or update['price'] <= 0 or update['stock'] < 0:
            return jsonify({'error': 'Validation failed'}), 400
        products_collection.update_one({'_id': ObjectId(product_id)}, {'$set': update})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/products/<product_id>', methods=['DELETE'])
@admin_required
def admin_delete_product(product_id):
    try:
        products_collection.delete_one({'_id': ObjectId(product_id)})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Public catalog (no auth)
@app.route('/api/products', methods=['GET'])
def public_list_products():
    try:
        items = []
        for p in products_collection.find({}):
            items.append({
                'id': str(p['_id']),
                'name': p.get('name'),
                'category': p.get('category'),
                'subcategory': p.get('subcategory', ''),
                'price': float(p.get('price', 0)),
                'description': p.get('description', ''),
                'stock': int(p.get('stock', 0)),
                'imageUrl': p.get('imageUrl', ''),
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Image upload (admin)
@app.route('/api/admin/upload', methods=['POST'])
@admin_required
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        filename = secure_filename(file.filename)
        ext = os.path.splitext(filename)[1].lower()

        # Accept if extension is known or MIME type indicates an image
        is_allowed_ext = ext in ALLOWED_IMAGE_EXTENSIONS
        is_image_mime = (file.mimetype or '').lower().startswith('image/')
        if not (is_allowed_ext or is_image_mime):
            return jsonify({'error': 'Invalid file type'}), 400

        # Infer extension from MIME if needed
        if not is_allowed_ext:
            mime = (file.mimetype or '').lower()
            mime_to_ext = {
                'image/jpeg': '.jpg',
                'image/jpg': '.jpg',
                'image/pjpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp',
                'image/avif': '.avif',
                'image/bmp': '.bmp',
                'image/tiff': '.tiff',
                'image/svg+xml': '.svg',
                'image/heic': '.heic',
                'image/heif': '.heif',
            }
            ext = mime_to_ext.get(mime, ext if ext else '.jpg')

        saved_name = f"{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{ext}"
        path = os.path.join(UPLOAD_DIR, saved_name)
        file.save(path)
        return jsonify({'url': f"/uploads/{saved_name}"})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# Orders: create (Razorpay), verify, list, update delivery status

def _normalize_order(o):
    return {
        'id': str(o['_id']),
        'userId': str(o.get('user_id')) if o.get('user_id') else '',
        'customerName': o.get('customerName') or '',
        'totalAmount': float(o.get('total_amount', o.get('total', 0))),
        'paymentStatus': o.get('payment_status', 'Pending'),
        'deliveryStatus': o.get('delivery_status', 'Pending'),
        'razorpayOrderId': o.get('razorpay_order_id', ''),
        'razorpayPaymentId': o.get('razorpay_payment_id', ''),
        'createdAt': o.get('created_at', datetime.datetime.utcnow()),
        'products': o.get('products', []),
    }

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    if not razorpay_client:
        return jsonify({'error': 'Payment gateway not configured'}), 500
    try:
        data = request.get_json() or {}
        products = data.get('products') or []
        total_amount = float(data.get('totalAmount') or 0)

        # Basic server-side total computation as fallback
        if not total_amount and products:
            total_amount = sum(float(p.get('price', 0)) * int(p.get('quantity', 1)) for p in products)

        if total_amount <= 0:
            return jsonify({'error': 'Invalid order amount'}), 400

        # Try to associate user if Authorization header is present
        user = get_current_user()
        receipt = f"gc_{int(datetime.datetime.utcnow().timestamp())}"
        rzp_order = razorpay_client.order.create({
            'amount': int(round(total_amount * 100)),  # INR paise
            'currency': 'INR',
            'receipt': receipt,
            'payment_capture': 1,
        })

        order_doc = {
            'user_id': user.get('_id') if user else None,
            'customerName': user.get('name') if user else '',
            'products': products,
            'total_amount': float(total_amount),
            'payment_status': 'Pending',
            'delivery_status': 'Pending',
            'razorpay_order_id': rzp_order.get('id'),
            'created_at': datetime.datetime.utcnow(),
        }
        res = orders_collection.insert_one(order_doc)

        return jsonify({
            'success': True,
            'orderId': rzp_order.get('id'),
            'amount': rzp_order.get('amount'),
            'currency': rzp_order.get('currency'),
            'dbOrderId': str(res.inserted_id),
            'razorpayKeyId': RAZORPAY_KEY_ID,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/orders/verify', methods=['POST'])
def verify_payment():
    if not razorpay_client:
        return jsonify({'error': 'Payment gateway not configured'}), 500
    try:
        data = request.get_json() or {}
        rzp_order_id = data.get('razorpay_order_id')
        rzp_payment_id = data.get('razorpay_payment_id')
        rzp_signature = data.get('razorpay_signature')
        db_order_id = data.get('dbOrderId')

        if not (rzp_order_id and rzp_payment_id and rzp_signature and db_order_id):
            return jsonify({'error': 'Missing verification fields'}), 400

        # Verify signature
        try:
            params_dict = {
                'razorpay_order_id': rzp_order_id,
                'razorpay_payment_id': rzp_payment_id,
                'razorpay_signature': rzp_signature,
            }
            razorpay_client.utility.verify_payment_signature(params_dict)
            verified = True
        except Exception as _:
            verified = False

        update = {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': rzp_payment_id,
            'payment_status': 'Success' if verified else 'Failed',
            'updated_at': datetime.datetime.utcnow(),
        }
        try:
            orders_collection.update_one({'_id': ObjectId(db_order_id)}, {'$set': update})
        except Exception:
            # fallback on razorpay_order_id lookup
            orders_collection.update_one({'razorpay_order_id': rzp_order_id}, {'$set': update})

        if verified:
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'Signature verification failed'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/orders', methods=['GET'])
@admin_required
def list_orders():
    try:
        status = request.args.get('paymentStatus')
        q = {}
        if status:
            q['payment_status'] = status
        items = []
        for o in orders_collection.find(q).sort('created_at', -1):
            items.append(_normalize_order(o))
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin stats
@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    try:
        return jsonify({
            'users': users_collection.count_documents({}),
            'products': products_collection.count_documents({}),
            'orders': orders_collection.count_documents({}),
            'remedies': remedies_collection.count_documents({}),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    try:
        data = request.get_json()
        delivery_status = data.get('status')
        if delivery_status not in ['Pending', 'Confirmed', 'Shipped', 'Delivered']:
            return jsonify({'error': 'Invalid status'}), 400
        orders_collection.update_one({'_id': ObjectId(order_id)}, {'$set': {'delivery_status': delivery_status}})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Remedies CRUD
@app.route('/api/remedies', methods=['GET'])
@admin_required
def list_remedies():
    try:
        items = []
        for r in remedies_collection.find():
            items.append({
                'id': str(r['_id']),
                'illness': r.get('illness'),
                'plant': r.get('plant'),
                'description': r.get('description', ''),
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remedies', methods=['POST'])
@admin_required
def create_remedy():
    try:
        data = request.get_json()
        doc = {
            'illness': data.get('illness'),
            'plant': data.get('plant'),
            'description': data.get('description', ''),
            'created_at': datetime.datetime.utcnow(),
        }
        res = remedies_collection.insert_one(doc)
        return jsonify({'id': str(res.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/remedies/<remedy_id>', methods=['PUT'])
@admin_required
def update_remedy(remedy_id):
    try:
        data = request.get_json()
        update = {
            'illness': data.get('illness'),
            'plant': data.get('plant'),
            'description': data.get('description', ''),
        }
        remedies_collection.update_one({'_id': ObjectId(remedy_id)}, {'$set': update})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/remedies/<remedy_id>', methods=['DELETE'])
@admin_required
def delete_remedy(remedy_id):
    try:
        remedies_collection.delete_one({'_id': ObjectId(remedy_id)})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)