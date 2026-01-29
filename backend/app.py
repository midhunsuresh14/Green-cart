from flask import Flask, request, jsonify, send_file, send_from_directory, make_response, g
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
import redis
import json
import openai  # Add OpenAI import
import base64
import requests

# Conditional import for cloudinary
try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    CLOUDINARY_AVAILABLE = True
except ImportError:
    print("Warning: Cloudinary library not available")
    CLOUDINARY_AVAILABLE = False
    # Create a dynamic mock object to prevent AttributeError
    import types
    
    class MockUploader:
        def upload(self, *args, **kwargs):
            return {}
    
    class MockApi:
        def delete_resources(self, *args, **kwargs):
            pass
    
    # Create a dynamic module-like object
    cloudinary = types.SimpleNamespace()
    cloudinary.config = lambda *args, **kwargs: None
    cloudinary.uploader = MockUploader()
    cloudinary.api = MockApi()

# Load environment variables
# Get the directory where this script is located
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)  # Explicitly load from backend directory

# Initialize Cloudinary only if available
if CLOUDINARY_AVAILABLE:
    try:
        cloud_name = os.getenv('CLOUD_NAME', '').strip()
        api_key = os.getenv('CLOUD_API_KEY', '').strip()
        api_secret = os.getenv('CLOUD_API_SECRET', '').strip()
        
        # Check if all required environment variables are set
        if not cloud_name or not api_key or not api_secret:
            print("Warning: Cloudinary environment variables not set. Please check your .env file or Vercel environment variables.")
            CLOUDINARY_AVAILABLE = False
        else:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret
            )
            print(f"Cloudinary configured successfully with cloud name: {cloud_name}")
    except Exception as e:
        print(f"Warning: Failed to configure Cloudinary: {e}")
        CLOUDINARY_AVAILABLE = False
else:
    print("Cloudinary library not available, using mock implementation")

app = Flask(__name__)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://greencart-frontend-r7zs.onrender.com",
    "https://green-cart-pi-sepia.vercel.app",
    "https://greencart-admin.onrender.com" # Adding another common pattern
]

CORS(
    app,
    resources={r"/*": {"origins": ALLOWED_ORIGINS}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
    supports_credentials=True,
    vary_header=True
)

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('EMAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = (os.getenv('EMAIL_FROM_NAME', 'GreenCart'), os.getenv('EMAIL_USERNAME'))

mail = Mail(app)

# Robust CORS helper
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if not origin:
        return response
        
    # Standardize origin (remove trailing slash)
    clean_origin = origin.rstrip('/')
    
    # Check if origin is allowed
    is_allowed = clean_origin in [o.rstrip('/') for o in ALLOWED_ORIGINS]
    
    if not is_allowed:
        # Check for subdomain/prefix matches if exact match fails
        for allowed in ALLOWED_ORIGINS:
            if clean_origin.startswith(allowed.rstrip('/')):
                is_allowed = True
                break
                
    if is_allowed:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        # For preflight or errors, we might need these
        if request.method == "OPTIONS":
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, Pragma, Expires, Accept'
            
    response.headers['Vary'] = 'Origin'
    return response

@app.after_request
def after_request(response):
    return add_cors_headers(response)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return add_cors_headers(make_response())

@app.route('/api/admin/clear-cache', methods=['POST'])
@admin_required
def manual_clear_cache():
    clear_products_cache()
    return jsonify({'success': True, 'message': 'Cache cleared successfully'})

def clear_products_cache():
    """Clear all products-related cache keys from Redis"""
    if redis_client:
        try:
            # Clear common keys
            keys = redis_client.keys("products_list_*")
            if keys:
                redis_client.delete(*keys)
                print(f"Cleared {len(keys)} product cache keys from Redis")
        except Exception as e:
            print(f"Error clearing Redis cache: {e}")

# File uploads (local dev) - serve from /uploads
# In serverless environments, we need to handle this differently
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')

# Only create the directory if we're not in a serverless environment
# Vercel and other serverless platforms have read-only file systems
if not os.getenv('VERCEL'):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.tif', '.tiff', '.svg', '.jfif', '.pjpeg', '.pjp', '.heic', '.heif'}

# MongoDB Configuration (env override supported)
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = "greencart"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db.users
products_collection = db.products
orders_collection = db.orders
remedies_collection = db.remedies
reviews_collection = db.reviews
notifications_collection = db.notifications
otp_collection = db.otp_verifications
categories_collection = db.categories
remedy_categories_collection = db.remedy_categories
crops_collection = db.crop_suitability

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'greencart-secret-key-2024-secure-jwt-token')

# Razorpay configuration
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
try:
    import razorpay
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None
except Exception:
    razorpay = None
    razorpay_client = None

# OTP Configuration
OTP_LENGTH = int(os.getenv('OTP_LENGTH', 6))
OTP_EXPIRY_MINUTES = int(os.getenv('OTP_EXPIRY_MINUTES', 10))

# Redis Configuration (optional)
REDIS_HOST = os.getenv('REDIS_HOST', None)
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379)) if os.getenv('REDIS_HOST') else None
REDIS_DB = int(os.getenv('REDIS_DB', 0)) if os.getenv('REDIS_HOST') else None
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None) if os.getenv('REDIS_HOST') else None

redis_client = None
if REDIS_HOST:
    try:
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT or 6379,
            db=REDIS_DB or 0,
            password=REDIS_PASSWORD,
            decode_responses=True
        )
        # Test Redis connection
        redis_client.ping()
        print("Redis connection successful")
    except Exception as e:
        print(f"Redis connection failed: {e}")
else:
    print("Redis is disabled")

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

# Auth helpers

def get_current_user():
    # If already found in this request context, return it
    if hasattr(g, 'current_user'):
        return g.current_user
        
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
        if user:
            g.current_user = user
        return user
    except Exception as e:
        print(f"Auth error in get_current_user: {str(e)}")
        return None


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Invalid token format'}), 401
            
        token = auth_header.split(' ', 1)[1]
        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = decoded.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'error': 'Invalid token payload'}), 401
            
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'success': False, 'error': 'User not found'}), 401
            
            # Store in g for subsequent calls to get_current_user() in the same request
            g.current_user = user
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        except Exception as e:
            print(f"Unexpected auth error: {str(e)}")
            return jsonify({'success': False, 'error': f'Authentication error: {str(e)}'}), 401
    return wrapper


def store_manager_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        if user.get('role') not in ['admin', 'store_manager']:
            return jsonify({'success': False, 'error': 'Forbidden: Store Managers only'}), 403
        return f(*args, **kwargs)
    return wrapper

def delivery_boy_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        if user.get('role') not in ['admin', 'delivery_boy']:
            return jsonify({'success': False, 'error': 'Forbidden: Delivery Boys only'}), 403
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

def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            else:
                return jsonify({'success': False, 'error': 'Invalid token format'}), 401
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = data.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'error': 'Invalid token'}), 401
                
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'success': False, 'error': 'User not found'}), 401
            
            # Add user to kwargs for access in the function
            kwargs['current_user'] = user
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'success': False, 'error': f'Authentication error: {str(e)}'}), 401
    return wrapper

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/')
def home():
    return 'GreenCart Flask Backend Running!'

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

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
        user_doc = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': 'user',
            'created_at': datetime.datetime.utcnow()
        }
        
        # Create admin notification for new user registration
        notification_doc = {
            'type': 'new_user',
            'message': f'New user registered: {email}',
            'user_email': email,
            'user_name': name,
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        notifications_collection.insert_one(notification_doc)
        
        # Insert user into MongoDB
        result = users_collection.insert_one(user_doc)
        
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

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
            
        # Find user by email
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Check password
        user_password = user.get('password')
        if not user_password:
             return jsonify({
                'success': False,
                'error': 'User account is not properly configured (missing password)'
            }), 401

        if not check_password_hash(user_password, password):
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
                'name': user.get('name'),
                'phone': user.get('phone'),
                'role': user.get('role', 'user')
            },
            'token': token
        }), 200
        
    except Exception as e:
        import traceback
        error_msg = f"Login error: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': error_msg
        }), 400

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
            try:
                # Handle image URLs properly - check all possible fields
                image_url = (p.get('image') or 
                            p.get('imageUrl') or 
                            p.get('imagePath') or 
                            p.get('image_path') or 
                            p.get('photo') or 
                            p.get('thumbnail') or 
                            '')
                
                # Ensure image_url starts with /uploads/ if it's a local path
                if image_url and not image_url.startswith('http') and not image_url.startswith('/uploads/'):
                    image_url = '/uploads/' + image_url.lstrip('/')
                
                doc = {
                    'id': str(p['_id']),
                    'name': p.get('name'),
                    'category': p.get('category'),
                    'subcategory': p.get('subcategory', ''),
                    'price': float(p.get('price', 0)),
                    'description': p.get('description', 'No description available'),
                    'stock': int(p.get('stock', 0)),
                    'imageUrl': image_url,
                    'image': image_url,  # Ensure both fields are present
                    'arModelUrl': p.get('arModelUrl', ''),
                }
                print(f"DEBUG: Admin Product {doc['id']} image_url: {image_url}") # Debug log
                if not q or q in (doc['name'] or '').lower() or q in (doc['category'] or '').lower() or q in (doc['subcategory'] or '').lower():
                    items.append(doc)
            except Exception as item_e:
                print(f"Error processing admin product {p.get('_id')}: {item_e}")
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/products', methods=['POST'])
@admin_required
def admin_create_product():
    try:
        data = request.get_json()
        # Handle image URL properly
        image_url = data.get('image') or data.get('imageUrl', '')
        
        # If image_url is a relative path, make it absolute
        if image_url and not image_url.startswith('http') and not image_url.startswith('/uploads/'):
            # If it's a relative path, make it absolute
            if not image_url.startswith('/'):
                image_url = '/uploads/' + image_url.lstrip('/')
        
        doc = {
            'name': data.get('name'),
            'category': data.get('category'),
            'subcategory': data.get('subcategory', ''),
            'price': float(data.get('price', 0)),
            'description': data.get('description', ''),
            'stock': int(data.get('stock', 0)),
            'imageUrl': image_url,
            'image': image_url,
            'arModelUrl': data.get('arModelUrl', ''),
            'created_at': datetime.datetime.utcnow(),
        }
        # validations
        if not doc['name'] or not doc['category'] or doc['price'] <= 0 or doc['stock'] < 0:
            return jsonify({'error': 'Validation failed'}), 400
        res = products_collection.insert_one(doc)
        clear_products_cache()
        return jsonify({'id': str(res.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/products/<product_id>', methods=['PUT'])
@admin_required
def admin_update_product(product_id):
    try:
        data = request.get_json()
        # Handle image URL properly
        image_url = data.get('image') or data.get('imageUrl', '')
        
        # If image_url is a relative path, make it absolute
        if image_url and not image_url.startswith('http') and not image_url.startswith('/uploads/'):
            # If it's a relative path, make it absolute
            if not image_url.startswith('/'):
                image_url = '/uploads/' + image_url.lstrip('/')
        
        update = {
            'name': data.get('name'),
            'category': data.get('category'),
            'subcategory': data.get('subcategory', ''),
            'price': float(data.get('price', 0)),
            'description': data.get('description', ''),
            'stock': int(data.get('stock', 0)),
            'imageUrl': image_url,
            'image': image_url,
            'arModelUrl': data.get('arModelUrl', ''),
        }
        if not update['name'] or not update['category'] or update['price'] <= 0 or update['stock'] < 0:
            return jsonify({'error': 'Validation failed'}), 400
        products_collection.update_one({'_id': ObjectId(product_id)}, {'$set': update})
        clear_products_cache()
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

# Public catalog (no auth) - WITH REDIS CACHING
@app.route('/api/products', methods=['GET'])
def public_list_products():
    try:
        # Initialize cache_key
        cache_key = f"products_list_{request.args.get('category', 'all')}_{request.args.get('subcategory', 'all')}"
        
        # Try to get cached response first (if Redis is available)
        if redis_client:
            try:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    # Ensure cached_data is a string before parsing
                    if isinstance(cached_data, (str, bytes)):
                        return jsonify(json.loads(cached_data))
                    else:
                        # If it's not a string/bytes, treat as already parsed data
                        return jsonify(cached_data)
            except Exception as e:
                print(f"Redis cache read error: {e}")
                # Continue without cache if Redis fails

        # If not in cache or Redis not available, fetch from database
        items = []
        for p in products_collection.find({}):
            try:
                # Handle image URLs properly - check all possible fields
                image_url = (p.get('image') or 
                            p.get('imageUrl') or 
                            p.get('imagePath') or 
                            p.get('image_path') or 
                            p.get('photo') or 
                            p.get('thumbnail') or 
                            '')
                
                # Ensure image_url starts with /uploads/ if it's a local path
                if image_url and not image_url.startswith('http') and not image_url.startswith('/uploads/'):
                    image_url = '/uploads/' + image_url.lstrip('/')
                
                items.append({
                    'id': str(p['_id']),
                    'name': p.get('name'),
                    'category': p.get('category'),
                    'subcategory': p.get('subcategory', ''),
                    'price': float(p.get('price', 0)),
                    'description': p.get('description', 'No description available'),
                    'stock': int(p.get('stock', 0)),
                    'imageUrl': image_url,
                    'image': image_url,  # Ensure both fields are present
                    'arModelUrl': p.get('arModelUrl', ''),
                })
            except Exception as item_e:
                print(f"Error processing product {p.get('_id')}: {item_e}")
        
        # Cache the result in Redis for 5 minutes (if Redis is available)
        if redis_client:
            try:
                redis_client.setex(cache_key, 300, json.dumps(items))
                print("Products cached in Redis for 5 minutes")
            except Exception as e:
                print(f"Error caching products in Redis: {e}")
        
        print(f"DEBUG: Public Product image_urls: {[item['imageUrl'] for item in items]}")
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add the missing endpoint for getting a single product by ID
@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_by_id(product_id):
    try:
        # Find product by ID
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Handle image URLs properly - check all possible fields
        image_url = (product.get('image') or 
                    product.get('imageUrl') or 
                    product.get('imagePath') or 
                    product.get('image_path') or 
                    product.get('photo') or 
                    product.get('thumbnail') or 
                    '')
        
        # Ensure image_url starts with /uploads/ if it's a local path
        if image_url and not image_url.startswith('http') and not image_url.startswith('/uploads/'):
            image_url = '/uploads/' + image_url.lstrip('/')
        
        # Prepare the response
        product_data = {
            'id': str(product['_id']),
            'name': product.get('name'),
            'category': product.get('category'),
            'subcategory': product.get('subcategory', ''),
            'price': float(product.get('price', 0)),
            'originalPrice': float(product.get('originalPrice', product.get('price', 0))),
            'discount': product.get('discount', 0),
            'description': product.get('description', 'No description available'),
            'stock': int(product.get('stock', 0)),
            'imageUrl': image_url,
            'image': image_url,  # Ensure both fields are present
            'arModelUrl': product.get('arModelUrl', ''),
            'rating': product.get('rating', 0),
            'reviews': product.get('reviews', 0),
            'images': product.get('images', [image_url])  # Ensure we have an images array
        }
        
        return jsonify(product_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Categories Management
@app.route('/api/categories', methods=['GET'])
def list_categories():
    try:
        items = []
        for cat in categories_collection.find({}):
            # Get subcategories for this category
            subcategories = []
            if 'subcategories' in cat:
                subcategories = cat['subcategories']
            
            # Ensure proper URL handling for uploaded images
            image_url = cat.get('imageUrl', '')
            if image_url and image_url.startswith('/uploads/'):
                # This is a relative path to an uploaded image
                full_image_url = image_url
            else:
                # This is either an external URL or empty
                full_image_url = image_url
            
            items.append({
                'id': str(cat['_id']),
                'name': cat.get('name'),
                'description': cat.get('description', ''),
                'imageUrl': full_image_url,  # Use the properly formatted image URL
                'subcategories': subcategories
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['POST'])
@admin_required
def create_category():
    try:
        data = request.get_json()
        doc = {
            'name': data.get('name'),
            'description': data.get('description', ''),
            'imageUrl': data.get('imageUrl', ''),  # Add imageUrl field
            'subcategories': []
        }
        if not doc['name']:
            return jsonify({'error': 'Name is required'}), 400
        
        result = categories_collection.insert_one(doc)
        return jsonify({'id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/categories/<category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    try:
        data = request.get_json()
        update = {
            'name': data.get('name'),
            'description': data.get('description', ''),
            'imageUrl': data.get('imageUrl', '')  # Add imageUrl field
        }
        if not update['name']:
            return jsonify({'error': 'Name is required'}), 400
        
        categories_collection.update_one({'_id': ObjectId(category_id)}, {'$set': update})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/categories/<category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    try:
        # Check if any remedies use this category
        remedies_using_category = remedies_collection.find_one({'category': {'$regex': f'^{category_id}$', '$options': 'i'}})
        if remedies_using_category:
            return jsonify({'error': 'Cannot delete category that is being used by remedies'}), 400
        
        categories_collection.delete_one({'_id': ObjectId(category_id)})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Subcategories Management
@app.route('/api/subcategories', methods=['POST'])
@admin_required
def create_subcategory():
    try:
        data = request.get_json()
        category_id = data.get('categoryId')
        subcategory = {
            'id': str(ObjectId()),  # Generate a unique ID for the subcategory
            'name': data.get('name'),
            'description': data.get('description', '')
        }
        
        if not subcategory['name'] or not category_id:
            return jsonify({'error': 'Name and categoryId are required'}), 400
        
        # Update the category to add the new subcategory
        result = categories_collection.update_one(
            {'_id': ObjectId(category_id)},
            {'$push': {'subcategories': subcategory}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Category not found'}), 404
            
        return jsonify({'id': subcategory['id']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/subcategories/<subcategory_id>', methods=['PUT'])
@admin_required
def update_subcategory(subcategory_id):
    try:
        data = request.get_json()
        category_id = data.get('categoryId')
        
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        
        # If categoryId is provided, we might need to move the subcategory
        if category_id:
            # First, remove the subcategory from its current category
            categories_collection.update_many(
                {'subcategories.id': subcategory_id},
                {'$pull': {'subcategories': {'id': subcategory_id}}}
            )
            
            # Then add it to the new category
            subcategory = {
                'id': subcategory_id,
                'name': data.get('name'),
                'description': data.get('description', '')
            }
            
            result = categories_collection.update_one(
                {'_id': ObjectId(category_id)},
                {'$push': {'subcategories': subcategory}}
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'Category not found'}), 404
        else:
            # Update the subcategory in its current category
            category = categories_collection.find_one({'subcategories.id': subcategory_id})
            if not category:
                return jsonify({'error': 'Subcategory not found'}), 404
            
            categories_collection.update_one(
                {'_id': category['_id'], 'subcategories.id': subcategory_id},
                {'$set': {
                    'subcategories.$.name': data.get('name'),
                    'subcategories.$.description': data.get('description', '')
                }}
            )
        
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/subcategories/<subcategory_id>', methods=['DELETE'])
@admin_required
def delete_subcategory(subcategory_id):
    try:
        # Find the category containing this subcategory
        category = categories_collection.find_one({'subcategories.id': subcategory_id})
        if not category:
            return jsonify({'error': 'Subcategory not found'}), 404
        
        # Check if any products use this subcategory
        products_using_subcategory = products_collection.find_one({'subcategory': {'$regex': f'^{subcategory_id}$', '$options': 'i'}})
        if products_using_subcategory:
            return jsonify({'error': 'Cannot delete subcategory that is being used by products'}), 400
        
        # Remove the subcategory
        categories_collection.update_one(
            {'_id': category['_id']},
            {'$pull': {'subcategories': {'id': subcategory_id}}}
        )
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Image upload (admin)
@app.route('/api/admin/upload', methods=['POST'])
@admin_required
def upload_image():
    try:
        # In serverless environments, we can't save files to the local filesystem
        if os.getenv('VERCEL'):
            return jsonify({'error': 'File uploads are not supported in serverless deployment'}), 400
            
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        if file.filename is None:
            return jsonify({'error': 'Invalid filename'}), 400
            
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

# Image upload (for regular users, e.g., blog posts)
@app.route('/api/upload', methods=['POST'])
@token_required
def upload_image_user(current_user=None):
    try:
        # In serverless environments, we can't save files to the local filesystem
        if os.getenv('VERCEL'):
            return jsonify({'error': 'File uploads are not supported in serverless deployment'}), 400
            
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        if file.filename is None:
            return jsonify({'error': 'Invalid filename'}), 400
            
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
    # In serverless environments, we can't serve files from the local filesystem
    if os.getenv('VERCEL'):
        return jsonify({'error': 'File serving is not supported in serverless deployment'}), 400
    return send_from_directory(UPLOAD_DIR, filename)

# Orders endpoints (basic list and status update)
@app.route('/api/orders', methods=['GET'])
@store_manager_required
def list_orders():
    try:
        # Get query parameters for filtering
        payment_status = request.args.get('paymentStatus')
        delivery_status = request.args.get('deliveryStatus')
        user_id = request.args.get('userId')
        sort_order = request.args.get('sortOrder', 'desc')  # Default to descending (newest first)
        
        # Build query
        query = {}
        if payment_status:
            query['paymentStatus'] = payment_status
        if delivery_status:
            query['deliveryStatus'] = delivery_status
        if user_id:
            query['userId'] = user_id
        
        # Debug logging
        print(f"DEBUG: Order query: {query}")
        
        items = []
        order_count = orders_collection.count_documents(query)
        print(f"DEBUG: Found {order_count} orders matching query")
        
        # Sort by creation date
        sort_direction = -1 if sort_order == 'desc' else 1
        
        for o in orders_collection.find(query).sort('created_at', sort_direction):
            items.append({
                'id': str(o['_id']),
                'customerName': o.get('userName'),
                'customerEmail': o.get('userEmail'),
                'userId': o.get('userId'),
                'totalAmount': float(o.get('total', 0)),
                'paymentStatus': o.get('paymentStatus', 'Pending'),
                'deliveryStatus': o.get('deliveryStatus', 'Pending'),
                'razorpayPaymentId': o.get('razorpay_payment_id'),
                'createdAt': o.get('created_at'),
            })
            
        print(f"DEBUG: Returning {len(items)} orders")
        return jsonify(items)
    except Exception as e:
        print(f"ERROR in list_orders: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/orders', methods=['GET'])
@login_required
def get_user_orders():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's orders, sorted by creation date (newest first)
        orders = list(orders_collection.find(
            {'userId': str(user['_id'])}
        ).sort('created_at', -1))
        
        # Format orders for frontend
        formatted_orders = []
        for o in orders:
            formatted_orders.append({
                'id': str(o['_id']),
                'customerName': o.get('userName'),
                'customerEmail': o.get('userEmail'),
                'userId': o.get('userId'),
                'totalAmount': float(o.get('total', 0)),
                'paymentStatus': o.get('paymentStatus', 'Pending'),
                'deliveryStatus': o.get('deliveryStatus', 'Pending'),
                'razorpayPaymentId': o.get('razorpay_payment_id'),
                'createdAt': o.get('created_at'),
                'items': o.get('items', []),
            })
        
        return jsonify(formatted_orders)
    except Exception as e:
        print(f"ERROR in get_user_orders: {e}")
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

@app.route('/api/admin/create-staff', methods=['POST'])
@admin_required
def create_staff():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')
        
        if not email or not password or not name or not role:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
            
        if role not in ['store_manager', 'delivery_boy']:
            return jsonify({'success': False, 'error': 'Invalid role for staff creation'}), 400
            
        # Check if user exists
        if users_collection.find_one({'email': email}):
            return jsonify({'success': False, 'error': 'Email already exists'}), 400
            
        # Create staff user
        hashed_password = generate_password_hash(password)
        user_doc = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role,
            'created_at': datetime.datetime.utcnow(),
            'active': True
        }
        
        users_collection.insert_one(user_doc)
        return jsonify({'success': True, 'message': f'Staff member {name} created successfully as {role}'}), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
@store_manager_required
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')
        # Mini project statuses
        valid_statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered']
        if status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Get the order to get user information
        order = orders_collection.find_one({'_id': ObjectId(order_id)})
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Update the order status
        orders_collection.update_one({'_id': ObjectId(order_id)}, {'$set': {'deliveryStatus': status}})
        
        # Send notification to user
        user_id = order.get('userId')
        if user_id:
            status_messages = {
                'Confirmed': 'Your order has been confirmed and is being prepared for shipment.',
                'Shipped': 'Your order has been shipped and is on its way to you.',
                'Delivered': 'Your order has been delivered successfully. Thank you for shopping with us!'
            }
            
            notification = {
                'userId': user_id,
                'title': f'Order #{order_id[:8]} Status Updated',
                'message': status_messages.get(status, f'Your order status has been updated to {status}'),
                'type': 'order_status',
                'relatedId': order_id,
                'read': False,
                'createdAt': datetime.datetime.utcnow()
            }
            notifications_collection.insert_one(notification)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Delivery endpoints
@app.route('/api/delivery/orders', methods=['GET'])
@delivery_boy_required
def list_delivery_orders():
    try:
        # Get list type: 'active' (default) or 'history'
        list_type = request.args.get('type', 'active')
        
        if list_type == 'history':
            query = {'deliveryStatus': 'Delivered'}
        else:
            # Active orders are those confirmed or shipped/out for delivery
            query = {'deliveryStatus': {'$in': ['Confirmed', 'Shipped']}}
            
        items = []
        # Sort history by delivery time if available, otherwise creation time
        sort_field = 'delivered_at' if list_type == 'history' else 'created_at'
        
        for o in orders_collection.find(query).sort(sort_field, -1).limit(50):
            items.append({
                'id': str(o['_id']),
                'customerName': o.get('userName'),
                'customerEmail': o.get('userEmail'),
                'customerPhone': o.get('userPhone'),
                'address': o.get('address', o.get('shippingAddress', {})),
                'totalAmount': float(o.get('total', 0)),
                'deliveryStatus': o.get('deliveryStatus', 'Pending'),
                'createdAt': o.get('created_at'),
                'deliveredAt': o.get('delivered_at'),
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delivery/orders/<order_id>/deliver', methods=['POST'])
@delivery_boy_required
def mark_order_delivered(order_id):
    try:
        result = orders_collection.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'deliveryStatus': 'Delivered', 'delivered_at': datetime.datetime.utcnow()}}
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Order not found'}), 404
            
        # Send notification
        order = orders_collection.find_one({'_id': ObjectId(order_id)})
        user_id = order.get('userId')
        if user_id:
            notification = {
                'userId': user_id,
                'title': f'Order #{order_id[:8]} Delivered',
                'message': 'Your order has been delivered successfully. Thank you for shopping with us!',
                'type': 'order_status',
                'relatedId': order_id,
                'read': False,
                'createdAt': datetime.datetime.utcnow()
            }
            notifications_collection.insert_one(notification)
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Remedies CRUD
@app.route('/api/remedies', methods=['GET'])
# Remedies CRUD
@app.route('/api/remedies', methods=['GET'])
def list_remedies():
    try:
        items = []
        for r in remedies_collection.find():
            items.append({
                'id': str(r['_id']),
                'name': r.get('name', ''),
                'illness': r.get('illness', ''),
                'category': r.get('category', ''),
                'keywords': r.get('keywords', []),
                'description': r.get('description', ''),
                'benefits': r.get('benefits', []),
                'preparation': r.get('preparation', ''),
                'dosage': r.get('dosage', ''),
                'duration': r.get('duration', ''),
                'precautions': r.get('precautions', ''),
                'effectiveness': r.get('effectiveness', ''),
                'imageUrl': r.get('imageUrl', ''),
                'tags': r.get('tags', []),
                'created_at': r.get('created_at')
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remedies/<remedy_id>', methods=['GET'])
def get_remedy(remedy_id):
    try:
        remedy = remedies_collection.find_one({'_id': ObjectId(remedy_id)})
        if not remedy:
            return jsonify({'error': 'Remedy not found'}), 404
        
        remedy_data = {
            'id': str(remedy['_id']),
            'name': remedy.get('name', ''),
            'illness': remedy.get('illness', ''),
            'category': remedy.get('category', ''),
            'keywords': remedy.get('keywords', []),
            'description': remedy.get('description', ''),
            'benefits': remedy.get('benefits', []),
            'preparation': remedy.get('preparation', ''),
            'dosage': remedy.get('dosage', ''),
            'duration': remedy.get('duration', ''),
            'precautions': remedy.get('precautions', ''),
            'effectiveness': remedy.get('effectiveness', ''),
            'imageUrl': remedy.get('imageUrl', ''),
            'tags': remedy.get('tags', []),
            'created_at': remedy.get('created_at')
        }
        return jsonify(remedy_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remedies', methods=['POST'])
@admin_required
def create_remedy():
    try:
        data = request.get_json()
        doc = {
            'name': data.get('name', ''),
            'illness': data.get('illness', ''),
            'category': data.get('category', ''),
            'keywords': data.get('keywords', []),
            'description': data.get('description', ''),
            'benefits': data.get('benefits', []),
            'preparation': data.get('preparation', ''),
            'dosage': data.get('dosage', ''),
            'duration': data.get('duration', ''),
            'precautions': data.get('precautions', ''),
            'effectiveness': data.get('effectiveness', ''),
            'imageUrl': data.get('imageUrl', ''),
            'tags': data.get('tags', []),
            'created_at': datetime.datetime.utcnow(),
        }
        if not doc['name'] or not doc['illness']:
            return jsonify({'error': 'Name and illness are required'}), 400
        
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
            'name': data.get('name', ''),
            'illness': data.get('illness', ''),
            'category': data.get('category', ''),
            'keywords': data.get('keywords', []),
            'description': data.get('description', ''),
            'benefits': data.get('benefits', []),
            'preparation': data.get('preparation', ''),
            'dosage': data.get('dosage', ''),
            'duration': data.get('duration', ''),
            'precautions': data.get('precautions', ''),
            'effectiveness': data.get('effectiveness', ''),
            'imageUrl': data.get('imageUrl', ''),
            'tags': data.get('tags', []),
        }
        if not update['name'] or not update['illness']:
            return jsonify({'error': 'Name and illness are required'}), 400
        
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

ALLOWED_MODEL_EXTENSIONS = {'.glb', '.gltf', '.usdz'}

@app.route('/api/admin/model-upload', methods=['POST'])
@admin_required
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No selected file'}), 400
            
        if file:
            # Check extension
            filename = secure_filename(file.filename)
            ext = os.path.splitext(filename)[1].lower()
            
            is_image = ext in ALLOWED_IMAGE_EXTENSIONS
            is_model = ext in ALLOWED_MODEL_EXTENSIONS
            
            if not (is_image or is_model):
                return jsonify({'success': False, 'error': 'File type not allowed. Allowed types: Images and 3D Models (.glb, .gltf, .usdz)'}), 400
            
            # Generate unique filename
            unique_filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
            
            # check if we are on Vercel
            is_vercel = os.getenv('VERCEL') == '1'
            
            if CLOUDINARY_AVAILABLE:
                # Upload to Cloudinary
                try:
                    # Reset pointer to start of file
                    file.stream.seek(0)
                    
                    # For models, use 'raw' resource type to preserve file format
                    resource_type = 'raw' if is_model else 'image'
                    
                    result = cloudinary.uploader.upload(
                        file,
                        folder="greencart/uploads",
                        public_id=os.path.splitext(unique_filename)[0],
                        resource_type=resource_type
                    )
                    return jsonify({
                        'success': True,
                        'url': result.get('secure_url'),
                        'public_id': result.get('public_id')
                    })
                except Exception as e:
                    print(f"Cloudinary upload failed: {e}")
                    if is_vercel:
                        return jsonify({
                            'success': False, 
                            'error': f'Cloudinary upload failed: {str(e)}. Please check your Cloudinary environment variables (CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET).'
                        }), 500
                    # For local dev, we can still fall back
                    print("Falling back to local storage for development.")
            
            # Local storage (only if not on Vercel)
            if is_vercel:
                error_msg = 'Cloudinary is not configured or failed. Persistent storage is required for uploads on Vercel.'
                if not CLOUDINARY_AVAILABLE:
                    error_msg = 'Cloudinary library is not available in the production environment. Please ensure it is in requirements.txt.'
                
                return jsonify({
                    'success': False, 
                    'error': error_msg
                }), 500

            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Ensure upload directory exists
            try:
                os.makedirs(UPLOAD_DIR, exist_ok=True)
            except Exception as e:
                return jsonify({'success': False, 'error': f'Failed to create upload directory: {str(e)}'}), 500
            
            # Reset pointer to start of file before saving
            file.stream.seek(0)
            file.save(file_path)
            
            # Return relative URL
            local_url = f"/uploads/{unique_filename}"
            return jsonify({
                'success': True,
                'url': local_url
            })
            
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/api/remedies/bulk-upload', methods=['POST'])
@admin_required
def bulk_upload_remedies():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
            
        if file.filename is None:
            return jsonify({'error': 'Invalid filename'}), 400
            
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read CSV content
        import csv
        import io
        
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        remedies_to_insert = []
        errors = []
        
        for row_num, row in enumerate(csv_input, start=2):  # Start from 2 because row 1 is header
            try:
                # Parse keywords, benefits, and tags from comma-separated strings
                keywords = [k.strip() for k in row.get('keywords', '').split(',') if k.strip()]
                benefits = [b.strip() for b in row.get('benefits', '').split(',') if b.strip()]
                tags = [t.strip() for t in row.get('tags', '').split(',') if t.strip()]
                
                # Create remedy document
                remedy = {
                    'name': row.get('name', '').strip(),
                    'illness': row.get('illness', '').strip(),
                    'category': row.get('category', '').strip(),
                    'keywords': keywords,
                    'description': row.get('description', '').strip(),
                    'benefits': benefits,
                    'preparation': row.get('preparation', '').strip(),
                    'dosage': row.get('dosage', '').strip(),
                    'duration': row.get('duration', '').strip(),
                    'precautions': row.get('precautions', '').strip(),
                    'effectiveness': row.get('effectiveness', '').strip(),
                    'imageUrl': row.get('imageUrl', '').strip(),
                    'tags': tags,
                    'created_at': datetime.datetime.utcnow(),
                }
                
                # Validate required fields
                if not remedy['name'] or not remedy['illness']:
                    errors.append(f"Row {row_num}: Name and illness are required")
                    continue
                
                remedies_to_insert.append(remedy)
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        # Insert valid remedies
        inserted_count = 0
        if remedies_to_insert:
            result = remedies_collection.insert_many(remedies_to_insert)
            inserted_count = len(result.inserted_ids)
        
        return jsonify({
            'success': True,
            'inserted': inserted_count,
            'errors': errors,
            'total_rows': len(remedies_to_insert) + len(errors)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Categories Management
@app.route('/api/product-categories', methods=['GET'])
def list_product_categories():
    try:
        items = []
        for cat in categories_collection.find({}):
            # Get subcategories for this category
            subcategories = []
            if 'subcategories' in cat:
                subcategories = cat['subcategories']
            
            # Ensure proper URL handling for uploaded images
            image_url = cat.get('imageUrl', '')
            if image_url and image_url.startswith('/uploads/'):
                # This is a relative path to an uploaded image
                full_image_url = image_url
            else:
                # This is either an external URL or empty
                full_image_url = image_url
            
            items.append({
                'id': str(cat['_id']),
                'name': cat.get('name'),
                'description': cat.get('description', ''),
                'imageUrl': full_image_url,  # Use the properly formatted image URL
                'subcategories': subcategories
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remedy-categories', methods=['GET'])
def list_remedy_categories():
    try:
        items = []
        for cat in remedy_categories_collection.find():
            items.append({
                'id': str(cat['_id']),
                'name': cat.get('name'),
                'description': cat.get('description', ''),
                'icon': cat.get('icon', '🌿'),
                'color': cat.get('color', '#4a7c59'),
                'created_at': cat.get('created_at')
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remedy-categories', methods=['POST'])
@admin_required
def create_remedy_category():
    try:
        data = request.get_json()
        doc = {
            'name': data.get('name'),
            'description': data.get('description', ''),
            'icon': data.get('icon', '🌿'),
            'color': data.get('color', '#4a7c59'),
            'created_at': datetime.datetime.utcnow(),
        }
        if not doc['name']:
            return jsonify({'error': 'Name is required'}), 400
        
        result = remedy_categories_collection.insert_one(doc)
        return jsonify({'id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/remedy-categories/<category_id>', methods=['PUT'])
@admin_required
def update_remedy_category(category_id):
    try:
        data = request.get_json()
        update = {
            'name': data.get('name'),
            'description': data.get('description', ''),
            'icon': data.get('icon', '🌿'),
            'color': data.get('color', '#4a7c59'),
        }
        if not update['name']:
            return jsonify({'error': 'Name is required'}), 400
        
        remedy_categories_collection.update_one({'_id': ObjectId(category_id)}, {'$set': update})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/remedy-categories/<category_id>', methods=['DELETE'])
@admin_required
def delete_remedy_category(category_id):
    try:
        # Check if any remedies use this category
        remedies_using_category = remedies_collection.find_one({'category': {'$regex': f'^{category_id}$', '$options': 'i'}})
        if remedies_using_category:
            return jsonify({'error': 'Cannot delete category that is being used by remedies'}), 400
        
        remedy_categories_collection.delete_one({'_id': ObjectId(category_id)})
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Reviews endpoints
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    try:
        product_id = request.args.get('productId')
        
        if product_id:
            # Get reviews for specific product
            reviews = list(reviews_collection.find({'productId': product_id}))
        else:
            # Get all reviews
            reviews = list(reviews_collection.find({}))
        
        # Calculate rating statistics
        if reviews:
            ratings = [r.get('rating', 0) for r in reviews]
            total_reviews = len(reviews)
            average_rating = sum(ratings) / total_reviews if total_reviews > 0 else 0
            
            # Count ratings by star level
            rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            for rating in ratings:
                if 1 <= rating <= 5:
                    rating_counts[rating] += 1
            
            # Format for frontend
            bars = [
                {'stars': 5, 'count': rating_counts[5]},
                {'stars': 4, 'count': rating_counts[4]},
                {'stars': 3, 'count': rating_counts[3]},
                {'stars': 2, 'count': rating_counts[2]},
                {'stars': 1, 'count': rating_counts[1]},
            ]
            
            # Format review items
            items = []
            for review in reviews:
                items.append({
                    'id': str(review['_id']),
                    'name': review.get('userName', 'Anonymous'),
                    'date': review.get('created_at', datetime.datetime.utcnow()).strftime('%d/%m/%Y'),
                    'text': review.get('reviewText', ''),
                    'rating': review.get('rating', 0),
                    'image': review.get('image', None)
                })
            
            return jsonify({
                'average': round(average_rating, 1),
                'total': total_reviews,
                'bars': bars,
                'items': items
            })
        else:
            # No reviews found
            return jsonify({
                'average': 0,
                'total': 0,
                'bars': [],
                'items': []
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reviews', methods=['POST'])
@login_required
def create_review():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        product_id = data.get('productId')
        rating = data.get('rating')
        review_text = data.get('reviewText')
        
        if not product_id or not rating:
            return jsonify({'error': 'Product ID and rating are required'}), 400
            
        # Check if product exists
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        # Check if user has already reviewed this product
        existing_review = reviews_collection.find_one({
            'userId': str(user['_id']),
            'productId': product_id
        })
        if existing_review:
            return jsonify({'error': 'You have already reviewed this product'}), 400
            
        # Create review
        review = {
            'userId': str(user['_id']),
            'userName': user.get('name', 'Anonymous'),
            'productId': product_id,
            'rating': rating,
            'reviewText': review_text,
            'created_at': datetime.datetime.utcnow()
        }
        
        result = reviews_collection.insert_one(review)
        return jsonify({'id': str(result.inserted_id)}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/create', methods=['POST'])
@login_required
def create_order():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        
        print(f"DEBUG: Received order data: {data}")  # Debug log
        
        # Handle different payload formats from frontend
        products = data.get('products', data.get('items', []))
        total_amount = data.get('totalAmount', data.get('total', 0))
        address = data.get('address', 'Not provided')
        
        print(f"DEBUG: Parsed - products: {products}, total: {total_amount}, address: {address}")  # Debug log
        
        if not products:
            return jsonify({'error': 'Products/items are required'}), 400
        
        if not total_amount or total_amount <= 0:
            return jsonify({'error': 'Valid total amount is required'}), 400
        
        # Check stock availability and update stock for each item
        for item in products:
            product_id = item.get('id') or item.get('_id')
            quantity = item.get('quantity', 1)
            
            if not check_stock_and_notify(product_id, quantity):
                product = products_collection.find_one({'_id': ObjectId(product_id)})
                product_name = product.get('name', 'Unknown') if product else 'Unknown'
                return jsonify({
                    'error': f'Insufficient stock for {product_name}. Please update your cart.'
                }), 400
        
        # Create order document
        order_doc = {
            'userId': str(user['_id']),
            'userName': user.get('name', 'Unknown'),
            'userEmail': user.get('email', ''),
            'items': products,
            'total': total_amount,
            'address': address,
            'status': 'pending',
            'paymentStatus': 'Pending',
            'deliveryStatus': 'Pending',
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        print(f"DEBUG: Creating order with document: {order_doc}")
        
        # Insert order
        result = orders_collection.insert_one(order_doc)
        
        # Debug logging
        print(f"DEBUG: Order created with ID: {result.inserted_id}")
        
        payment_method = data.get('paymentMethod', 'razorpay')
        
        if payment_method == 'cod':
            # Update order for COD
            orders_collection.update_one(
                {'_id': result.inserted_id},
                {'$set': {
                    'status': 'confirmed',
                    'paymentStatus': 'Cash on Delivery',
                    'paymentMethod': 'cod'
                }}
            )
            return jsonify({
                'orderId': str(result.inserted_id),
                'status': 'success',
                'paymentMethod': 'cod',
                'message': 'Order placed successfully (Cash on Delivery)'
            }), 201

        # Create Razorpay order
        rzp_order_id = None
        amount_paise = int(total_amount * 100)
        if razorpay_client:
            try:
                rzp_order_data = {
                    'amount': amount_paise,  # in paise
                    'currency': 'INR',
                    'receipt': str(result.inserted_id),
                    'payment_capture': 1,
                }
                order = getattr(razorpay_client, 'order', None)
                if order and hasattr(order, 'create'):
                    rzp_order = order.create(rzp_order_data)
                    rzp_order_id = rzp_order.get('id')
                else:
                    return jsonify({'error': 'Razorpay order creation not available'}), 500
            except Exception as e:
                return jsonify({'error': f'Failed to create Razorpay order: {str(e)}'}), 500
        else:
            return jsonify({'error': 'Razorpay is not configured on server'}), 500

        # Save Razorpay order id
        orders_collection.update_one(
            {'_id': result.inserted_id},
            {'$set': {'razorpay_order_id': rzp_order_id}}
        )
        
        print(f"DEBUG: Razorpay order ID saved: {rzp_order_id}")

        return jsonify({
            'orderId': str(result.inserted_id),
            'razorpayKeyId': RAZORPAY_KEY_ID,
            'razorpayOrderId': rzp_order_id,
            'amount': amount_paise,
            'currency': 'INR',
            'status': 'success',
            'message': 'Order created successfully'
        }), 201
        
    except Exception as e:
        print(f"ERROR in create_order: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/verify', methods=['POST'])
@login_required
def verify_payment():
    try:
        data = request.get_json()
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_signature = data.get('razorpay_signature')
        order_id = data.get('dbOrderId')
        
        print(f"DEBUG: Payment verification data: {data}")

        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id]):
            return jsonify({'success': False, 'error': 'Missing payment verification fields'}), 400

        if not razorpay_client:
            return jsonify({'success': False, 'error': 'Razorpay is not configured on server'}), 500

        # Verify signature
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            # Use getattr to safely access the utility attribute
            utility = getattr(razorpay_client, 'utility', None)
            if utility and hasattr(utility, 'verify_payment_signature'):
                utility.verify_payment_signature(params_dict)
            else:
                return jsonify({'success': False, 'error': 'Razorpay utility not available'}), 500
        except Exception as e:
            return jsonify({'success': False, 'error': f'Signature verification failed: {str(e)}'}), 400

        # Mark order as paid
        print(f"DEBUG: Updating order {order_id} status to Success/Confirmed")
        orders_collection.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'paymentStatus': 'Success', 'deliveryStatus': 'Confirmed', 'razorpay_payment_id': razorpay_payment_id}}
        )

        # Reduce stock after payment is confirmed
        order = orders_collection.find_one({'_id': ObjectId(order_id)})
        if order and 'items' in order:
            reduce_stock_after_order(order['items'])

        return jsonify({'success': True, 'message': 'Payment verified successfully'})

    except Exception as e:
        print(f"ERROR in verify_payment: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Stock Management Functions
def check_stock_and_notify(product_id, quantity_ordered):
    """Check stock levels without reducing them"""
    try:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            return False
        
        current_stock = product.get('stock', 0)
        # Check if enough stock is available WITHOUT reducing it
        available = current_stock >= quantity_ordered
        
        # Send notification if stock is low (but don't reduce stock yet)
        if available and current_stock - quantity_ordered <= 0:
            send_admin_notification(
                'OUT_OF_STOCK',
                f"Product '{product.get('name', 'Unknown')}' will be out of stock after this order!",
                {'productId': product_id, 'productName': product.get('name')}
            )
        elif available and current_stock - quantity_ordered <= 5:  # Low stock threshold
            send_admin_notification(
                'LOW_STOCK',
                f"Product '{product.get('name', 'Unknown')}' will have only {current_stock - quantity_ordered} items left after this order!",
                {'productId': product_id, 'productName': product.get('name'), 'remainingStock': current_stock - quantity_ordered}
            )
        
        return available
    except Exception as e:
        print(f"Error in stock check: {e}")
        return False

def reduce_stock_after_order(products):
    """Reduce stock after order is confirmed"""
    try:
        for item in products:
            product_id = item.get('id') or item.get('_id')
            quantity = item.get('quantity', 1)
            
            product = products_collection.find_one({'_id': ObjectId(product_id)})
            if not product:
                continue
            
            current_stock = product.get('stock', 0)
            new_stock = current_stock - quantity
            
            # Update stock
            products_collection.update_one(
                {'_id': ObjectId(product_id)},
                {'$set': {'stock': max(0, new_stock)}}
            )
            
            # Send notification if stock is low or out
            if new_stock <= 0:
                send_admin_notification(
                    'OUT_OF_STOCK',
                    f"Product '{product.get('name', 'Unknown')}' is now out of stock!",
                    {'productId': product_id, 'productName': product.get('name')}
                )
            elif new_stock <= 5:  # Low stock threshold
                send_admin_notification(
                    'LOW_STOCK',
                    f"Product '{product.get('name', 'Unknown')}' has only {new_stock} items left in stock!",
                    {'productId': product_id, 'productName': product.get('name'), 'remainingStock': new_stock}
                )
        
        return True
    except Exception as e:
        print(f"Error reducing stock: {e}")
        return False

def send_admin_notification(notification_type, message, data=None):
    """Send notification to admin"""
    try:
        notification = {
            'type': notification_type,
            'message': message,
            'data': data or {},
            'read': False,
            'created_at': datetime.datetime.utcnow()
        }
        notifications_collection.insert_one(notification)
        print(f"Admin notification sent: {message}")
    except Exception as e:
        print(f"Error sending notification: {e}")

# Stock Management Endpoints
@app.route('/api/products/<product_id>/stock', methods=['GET'])
def get_product_stock(product_id):
    try:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({
            'productId': product_id,
            'stock': product.get('stock', 0),
            'inStock': product.get('stock', 0) > 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<product_id>/check-availability', methods=['POST'])
def check_product_availability(product_id):
    try:
        data = request.get_json()
        requested_quantity = data.get('quantity', 1)
        
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        current_stock = product.get('stock', 0)
        available = current_stock >= requested_quantity
        
        return jsonify({
            'available': available,
            'currentStock': current_stock,
            'requestedQuantity': requested_quantity,
            'maxAvailable': current_stock
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/low-stock', methods=['GET'])
@admin_required
def get_low_stock():
    try:
        threshold = int(request.args.get('threshold', 10))
        
        # Find products with stock below threshold
        low_stock_products = list(products_collection.find({
            'stock': {'$lt': threshold, '$exists': True}
        }))
        
        items = []
        for product in low_stock_products:
            items.append({
                'id': str(product['_id']),
                'name': product.get('name', 'Unknown'),
                'stock': product.get('stock', 0),
                'category': product.get('category', ''),
                'imageUrl': product.get('imageUrl', product.get('image', ''))
            })
        
        return jsonify({
            'items': items,
            'count': len(items),
            'threshold': threshold
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/notifications', methods=['GET'])
@admin_required
def get_admin_notifications():
    try:
        notifications = list(notifications_collection.find().sort('created_at', -1).limit(50))
        
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
            created_at = notification.get('created_at')
            if created_at and hasattr(created_at, 'isoformat'):
                notification['created_at'] = created_at.isoformat()
            else:
                notification['created_at'] = None
        
        return jsonify({
            'success': True,
            'notifications': notifications
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/notifications/<notification_id>/mark-read', methods=['PUT'])
@admin_required
def mark_notification_read(notification_id):
    try:
        notifications_collection.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'read': True}}
        )
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User notifications
@app.route('/api/notifications', methods=['GET'])
@login_required
def get_user_notifications():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get notifications for the current user, sorted by creation date (newest first)
        notifications = list(notifications_collection.find(
            {'userId': str(user['_id'])}
        ).sort('createdAt', -1).limit(50))
        
        # Format notifications for frontend
        formatted_notifications = []
        for n in notifications:
            formatted_notifications.append({
                '_id': str(n['_id']),
                'title': n.get('title', ''),
                'message': n.get('message', ''),
                'type': n.get('type', ''),
                'relatedId': n.get('relatedId', ''),
                'read': n.get('read', False),
                'created_at': n.get('createdAt', datetime.datetime.utcnow())
            })
        
        return jsonify({
            'notifications': formatted_notifications,
            'unreadCount': len([n for n in formatted_notifications if not n['read']])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
@login_required
def mark_user_notification_read(notification_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify the notification belongs to the user
        notification = notifications_collection.find_one({
            '_id': ObjectId(notification_id),
            'userId': str(user['_id'])
        })
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notifications_collection.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'read': True}}
        )
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add Redis cache clearing endpoint
@app.route('/api/clear-product-cache', methods=['POST'])
@admin_required
def clear_product_cache():
    try:
        if redis_client:
            cache_key = "products_list"
            redis_client.delete(cache_key)
            return jsonify({'success': True, 'message': 'Product cache cleared'})
        else:
            return jsonify({'success': False, 'message': 'Redis not configured'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Cloudinary Upload Endpoint
@app.route('/api/cloudinary-upload', methods=['POST'])
def upload_to_cloudinary():
    try:
        # Check if Cloudinary is available
        if not CLOUDINARY_AVAILABLE:
            return jsonify({'error': 'Cloudinary library not installed or environment variables (CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET) are missing.'}), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        # Check if base64 image string is provided
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        
        # Check if image data is base64 string
        if not isinstance(image_data, str) or not image_data.startswith('data:image'):
            return jsonify({'error': 'Invalid image format. Expected base64 string.'}), 400
        
        # Upload image to Cloudinary
        upload_result = cloudinary.uploader.upload(
            image_data,
            folder="greencart_uploads",
            use_filename=True,
            unique_filename=False
        )
        
        # Debug: Print the upload result
        print(f"Cloudinary upload result: {upload_result}")
        
        # Check if secure_url is in the result
        if 'secure_url' not in upload_result:
            return jsonify({'error': f'Upload failed: secure_url not found in response. Full response: {upload_result}'}), 500
        
        # Return the secure URL of the uploaded image
        return jsonify({
            'success': True,
            'url': upload_result['secure_url']
        }), 200
        
    except Exception as e:
        # Handle general errors
        # Check if it's a Cloudinary-specific error
        if 'Cloudinary' in str(e) or 'cloudinary' in str(e).lower():
            return jsonify({'error': f'Cloudinary error: {str(e)}'}), 500
        else:
            return jsonify({'error': f'Upload failed: {str(e)}'}), 500

# Plant Identification Endpoint using PlantNet API
@app.route('/api/plant/identify', methods=['POST'])
def identify_plant():
    try:
        import requests
        from io import BytesIO
        
        data = request.get_json()
        
        # Check if image data is provided
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        
        # Check if image data is base64 string
        if not isinstance(image_data, str) or not image_data.startswith('data:image'):
            return jsonify({'error': 'Invalid image format. Expected base64 string.'}), 400
        
        # Extract base64 data (remove data:image/...;base64, prefix)
        base64_data = image_data.split(',')[1] if ',' in image_data else image_data
        
        # Decode base64 to bytes
        try:
            image_bytes = base64.b64decode(base64_data)
        except Exception as e:
            return jsonify({'error': f'Invalid base64 data: {str(e)}'}), 400
        
        # Get PlantNet API key from environment (REQUIRED)
        plantnet_api_key = os.getenv('PLANTNET_API_KEY', '').strip()
        
        # Check if API key is provided
        if not plantnet_api_key:
            return jsonify({
                'error': 'PlantNet API key is not configured. Please set PLANTNET_API_KEY in your environment variables. Get a free API key at https://my.plantnet.org/',
                'status_code': 500
            }), 500
        
        # Prepare PlantNet API request
        # PlantNet API endpoint
        plantnet_url = 'https://my-api.plantnet.org/v2/identify'
        
        # Use 'all' as the project (includes all available plant databases)
        # You can also use specific projects like 'weurope', 'europe', 'usa', etc.
        project = data.get('project', 'all')
        
        # Prepare multipart form data
        files = {
            'images': ('plant.jpg', BytesIO(image_bytes), 'image/jpeg')
        }
        
        params = {
            'include-related-images': 'false',
            'no-reject': 'false',
            'lang': 'en',
            'type': 'kt',  # kt = kind of (plant type)
            'api-key': plantnet_api_key  # API key as query parameter
        }
        
        # Don't set Content-Type header - requests library will set it automatically
        # with the correct boundary for multipart/form-data
        headers = {}
        
        # Make request to PlantNet API
        response = requests.post(
            f'{plantnet_url}/{project}',
            files=files,
            params=params,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 401:
            error_msg = 'PlantNet API authentication failed. Please check your PLANTNET_API_KEY in environment variables.'
            try:
                error_data = response.json()
                if 'message' in error_data:
                    error_msg = f'Authentication error: {error_data["message"]}'
            except:
                pass
            
            return jsonify({
                'error': error_msg,
                'status_code': 401,
                'help': 'Get a free API key at https://my.plantnet.org/'
            }), 401
        
        if response.status_code != 200:
            error_msg = f'PlantNet API error: {response.status_code}'
            try:
                error_data = response.json()
                error_msg = error_data.get('message', error_data.get('error', error_msg))
            except:
                error_msg = response.text or error_msg
            
            return jsonify({
                'error': error_msg,
                'status_code': response.status_code
            }), 500
        
        plantnet_data = response.json()
        
        # Debug: Print the response structure
        print(f"PlantNet API response keys: {plantnet_data.keys() if isinstance(plantnet_data, dict) else 'Not a dict'}")
        
        # Process PlantNet response
        results = []
        if 'results' in plantnet_data and isinstance(plantnet_data['results'], list):
            for result in plantnet_data['results'][:5]:  # Top 5 results
                try:
                    species = result.get('species', {})
                    if not isinstance(species, dict):
                        species = {}
                    
                    score = result.get('score', 0)
                    if not isinstance(score, (int, float)):
                        score = 0
                    
                    # Get common names and scientific name
                    common_names = species.get('commonNames', [])
                    if not isinstance(common_names, list):
                        common_names = []
                    
                    scientific_name = species.get('scientificNameWithoutAuthor', '') or species.get('scientificName', '')
                    scientific_name_full = species.get('scientificNameAuthorship', '') or species.get('scientificName', '')
                    
                    # Get genus and family - handle nested structures safely
                    genus = ''
                    family = ''
                    
                    genus_obj = species.get('genus', {})
                    if isinstance(genus_obj, dict):
                        genus = genus_obj.get('scientificNameWithoutAuthor', '') or genus_obj.get('scientificName', '')
                    
                    family_obj = species.get('family', {})
                    if isinstance(family_obj, dict):
                        family = family_obj.get('scientificNameWithoutAuthor', '') or family_obj.get('scientificName', '')
                    
                    results.append({
                        'scientificName': scientific_name or 'Unknown',
                        'scientificNameFull': scientific_name_full or scientific_name or 'Unknown',
                        'commonNames': common_names[:3] if common_names else [],
                        'genus': genus,
                        'family': family,
                        'confidence': round(float(score) * 100, 2) if score else 0.0,
                        'score': float(score) if score else 0.0
                    })
                except Exception as e:
                    print(f"Error processing result: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue  # Skip this result and continue with next
        
        if not results:
            return jsonify({
                'error': 'No plant species identified. Please try a clearer photo.',
                'results': []
            }), 200
        
        # Return formatted results
        return jsonify({
            'success': True,
            'results': results,
            'bestMatch': results[0] if results else None
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout. Please try again.'}), 504
    except requests.exceptions.RequestException as e:
        print(f"PlantNet API request error: {str(e)}")
        return jsonify({'error': f'Network error: {str(e)}'}), 500
    except Exception as e:
        import traceback
        print(f"Plant identification error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Identification failed: {str(e)}'}), 500

# Chatbot Endpoint with Mistral/OpenAI support
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'Messages are required'}), 400
        
        # Check for Mistral API key first, fallback to OpenAI
        mistral_api_key = os.getenv('MISTRAL_API_KEY')
        openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if mistral_api_key:
            # Use Mistral API
            import requests
            headers = {
                'Authorization': f'Bearer {mistral_api_key}',
                'Content-Type': 'application/json'
            }
            
            # Format messages for Mistral (remove 'system' role if present)
            mistral_messages = []
            for msg in messages:
                if msg['role'] != 'system':
                    mistral_messages.append(msg)
                else:
                    # Add system message as first user message
                    if not mistral_messages:
                        mistral_messages.append({'role': 'user', 'content': msg['content']})
                    else:
                        mistral_messages[0]['content'] = msg['content'] + '\n\n' + mistral_messages[0]['content']
            
            payload = {
                'model': 'mistral-small-latest',
                'messages': mistral_messages,
                'max_tokens': 300,
                'temperature': 0.7
            }
            
            response = requests.post(
                'https://api.mistral.ai/v1/chat/completions',
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                bot_response = response.json()['choices'][0]['message']['content']
                return jsonify({'response': bot_response})
            else:
                return jsonify({'error': f'Mistral API error: {response.status_code} - {response.text}'}), 500
                
        elif openai_api_key:
            # Fallback to OpenAI API
            client = openai.OpenAI(api_key=openai_api_key)
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            # Extract the response
            bot_response = response.choices[0].message.content
            
            return jsonify({'response': bot_response})
        else:
            # Fallback to rule-based responses if no API keys configured
            return jsonify({'error': 'No API keys configured. Please set MISTRAL_API_KEY or OPENAI_API_KEY in environment variables.'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

# Feedback Endpoints
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('ratings') or not data.get('ratings').get('overall'):
            return jsonify({'error': 'Overall rating is required'}), 400
        
        # Prepare feedback document
        feedback_doc = {
            'userId': data.get('userId'),
            'userEmail': data.get('userEmail'),
            'ratings': data.get('ratings', {}),
            'feedback': data.get('feedback', ''),
            'suggestions': data.get('suggestions', ''),
            'timestamp': data.get('timestamp', datetime.datetime.utcnow().isoformat()),
            'pageUrl': data.get('pageUrl', ''),
            'userAgent': data.get('userAgent', ''),
            'createdAt': datetime.datetime.utcnow(),
            'status': 'new'
        }
        
        # Insert into database
        result = db.feedback.insert_one(feedback_doc)
        
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully',
            'feedbackId': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/feedback', methods=['GET'])
@token_required
def get_feedback(current_user=None):
    try:
        # Check if user is admin
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        status = request.args.get('status', 'all')
        sort_by = request.args.get('sort_by', 'createdAt')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build query
        query = {}
        if status != 'all':
            query['status'] = status
        
        # Build sort
        sort_direction = -1 if sort_order == 'desc' else 1
        sort_criteria = [(sort_by, sort_direction)]
        
        # Get total count
        total = db.feedback.count_documents(query)
        
        # Get feedback with pagination
        skip = (page - 1) * limit
        feedback_list = list(db.feedback.find(query)
                           .sort(sort_criteria)
                           .skip(skip)
                           .limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for feedback in feedback_list:
            feedback['_id'] = str(feedback['_id'])
            if feedback.get('userId'):
                feedback['userId'] = str(feedback['userId'])
        
        return jsonify({
            'feedback': feedback_list,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/feedback/<feedback_id>/status', methods=['PUT'])
@token_required
def update_feedback_status(feedback_id, current_user=None):
    try:
        # Check if user is admin
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        # Update feedback status
        result = db.feedback.update_one(
            {'_id': ObjectId(feedback_id)},
            {'$set': {'status': new_status, 'updatedAt': datetime.datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Feedback not found'}), 404
        
        return jsonify({'success': True, 'message': 'Feedback status updated'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Blog Endpoints
@app.route('/api/blog/posts', methods=['GET'])
def get_blog_posts():
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        category = request.args.get('category', None)
        sort_by = request.args.get('sortBy', 'latest')
        search = request.args.get('search', None)
        
        # Build query
        query = {}
        if category and category != 'All':
            query['category'] = category
            
        # Add search functionality
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'content': {'$regex': search, '$options': 'i'}}
            ]
            
        # Determine sort order
        sort_field = 'created_at'
        sort_direction = -1  # Descending by default
        
        if sort_by == 'most_liked':
            sort_field = 'likes'
        elif sort_by == 'trending':
            # For trending, we could use a combination of likes and recency
            # For simplicity, we'll sort by likes for now
            sort_field = 'likes'
        # 'latest' uses created_at with descending order (default)
            
        # Get total count
        total = db.blog_posts.count_documents(query)
        
        # Get posts with pagination and sorting
        skip = (page - 1) * limit
        posts = list(db.blog_posts.find(query)
                     .sort([(sort_field, sort_direction), ('created_at', -1)])
                     .skip(skip)
                     .limit(limit))
        
        # Try to get current user from token (if provided)
        current_user = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]
            try:
                decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                user_id = decoded.get('user_id')
                if user_id:
                    current_user = users_collection.find_one({'_id': ObjectId(user_id)})
            except Exception:
                # If token is invalid, continue without user
                pass
        
        # Convert ObjectId to string for JSON serialization and add like status
        for post in posts:
            post['_id'] = str(post['_id'])
            if post.get('author_id'):
                post['author_id'] = str(post['author_id'])
            
            # Add like status if user is logged in
            if current_user:
                existing_like = db.blog_likes.find_one({
                    'post_id': str(post['_id']),
                    'user_id': str(current_user['_id'])
                })
                post['liked'] = existing_like is not None
            else:
                post['liked'] = False
        
        return jsonify({
            'posts': posts,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts', methods=['POST'])
@token_required
def create_blog_post(current_user=None):
    try:
        print(f"DEBUG: create_blog_post called with current_user: {current_user}")
        if not current_user:
            print("DEBUG: No current_user found, returning error")
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")
        
        # Validate required fields
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Title and content are required'}), 400
        
        # Prepare blog post document
        post_doc = {
            'title': data.get('title'),
            'content': data.get('content'),
            'category': data.get('category', 'General'),
            'image_url': data.get('image_url', ''),
            'author_id': str(current_user['_id']),
            'author_name': current_user.get('name', 'Anonymous'),
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow(),
            'likes': 0,
            'comments_count': 0
        }
        
        print(f"DEBUG: Creating post with document: {post_doc}")
        
        # Insert into database
        result = db.blog_posts.insert_one(post_doc)
        
        # Add the inserted ID to the response
        post_doc['_id'] = str(result.inserted_id)
        
        print(f"DEBUG: Post created successfully with ID: {result.inserted_id}")
        
        return jsonify({
            'success': True,
            'message': 'Blog post created successfully',
            'post': post_doc
        }), 201
        
    except Exception as e:
        print(f"DEBUG: Exception in create_blog_post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>', methods=['GET'])
def get_blog_post(post_id):
    try:
        # Validate that post_id is a valid ObjectId
        if not ObjectId.is_valid(post_id):
            return jsonify({'error': f"'{post_id}' is not a valid ObjectId, it must be a 12-byte input or a 24-character hex string"}), 400
        
        # Get the post
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Convert ObjectId to string for JSON serialization
        post['_id'] = str(post['_id'])
        if post.get('author_id'):
            post['author_id'] = str(post['author_id'])
        
        # Get comments for this post
        comments = list(db.blog_comments.find({'post_id': post_id})
                       .sort('created_at', 1))
        
        # Convert ObjectId to string for JSON serialization
        for comment in comments:
            comment['_id'] = str(comment['_id'])
            if comment.get('author_id'):
                comment['author_id'] = str(comment['author_id'])
        
        return jsonify({
            'post': post,
            'comments': comments
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>', methods=['PUT'])
@token_required
def update_blog_post(post_id):
    try:
        # Get user from token
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]
            try:
                decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                user_id = decoded.get('user_id')
                if user_id:
                    user = users_collection.find_one({'_id': ObjectId(user_id)})
                else:
                    return jsonify({'error': 'Invalid token'}), 401
            except Exception:
                return jsonify({'error': 'Invalid token'}), 401
        else:
            return jsonify({'error': 'Token is missing'}), 401
            
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if post exists and user is the author
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
            
        if str(post.get('author_id', '')) != str(user['_id']) and user.get('role') != 'admin':
            return jsonify({'error': 'You are not authorized to update this post'}), 403
            
        data = request.get_json()
        
        # Prepare update document
        update_doc = {
            'title': data.get('title', post['title']),
            'content': data.get('content', post['content']),
            'category': data.get('category', post['category']),
            'image_url': data.get('image_url', post['image_url']),
            'updated_at': datetime.datetime.utcnow()
        }
        
        # Update the post
        db.blog_posts.update_one({'_id': ObjectId(post_id)}, {'$set': update_doc})
        
        return jsonify({
            'success': True,
            'message': 'Blog post updated successfully',
            'post': update_doc
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>', methods=['DELETE'])
@token_required
def delete_blog_post(post_id, current_user=None):
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if post exists and user is the author
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
            
        if str(post.get('author_id', '')) != str(current_user['_id']) and current_user.get('role') != 'admin':
            return jsonify({'error': 'You are not authorized to delete this post'}), 403
            
        # Delete the post
        db.blog_posts.delete_one({'_id': ObjectId(post_id)})
        
        return jsonify({
            'success': True,
            'message': 'Blog post deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>/comments', methods=['POST'])
@token_required
def add_blog_comment(post_id, current_user=None):
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if post exists
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
            
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Comment content is required'}), 400
        
        # Prepare comment document
        comment_doc = {
            'post_id': post_id,
            'content': data.get('content'),
            'author_id': str(current_user['_id']),
            'author_name': current_user.get('name', 'Anonymous'),
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        # Insert comment
        result = db.blog_comments.insert_one(comment_doc)
        
        # Add the inserted ID to the response
        comment_doc['_id'] = str(result.inserted_id)
        
        # Increment comments count on the post
        db.blog_posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$inc': {'comments_count': 1}}
        )
        
        # Create notification for post author (if not self-comment)
        if str(post.get('author_id', '')) != str(current_user['_id']):
            db.blog_notifications.insert_one({
                'user_id': str(post['author_id']),
                'post_id': post_id,
                'comment_id': str(result.inserted_id),
                'type': 'comment',
                'actor_id': str(current_user['_id']),
                'actor_name': current_user.get('name', 'Someone'),
                'created_at': datetime.datetime.utcnow(),
                'read': False
            })
        
        return jsonify({
            'success': True,
            'message': 'Comment added successfully',
            'comment': comment_doc
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/comments/<comment_id>', methods=['DELETE'])
@token_required
def delete_blog_comment(comment_id, current_user=None):
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if comment exists
        comment = db.blog_comments.find_one({'_id': ObjectId(comment_id)})
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
            
        # Check if user is the author or admin
        if str(comment.get('author_id', '')) != str(current_user['_id']) and current_user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized to delete this comment'}), 403
        
        # Delete the comment
        db.blog_comments.delete_one({'_id': ObjectId(comment_id)})
        
        # Decrement comments count on the post
        db.blog_posts.update_one(
            {'_id': ObjectId(comment['post_id'])},
            {'$inc': {'comments_count': -1}}
        )
        
        return jsonify({
            'success': True,
            'message': 'Comment deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>/like', methods=['POST'])
@token_required
def like_blog_post(post_id, current_user=None):
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if post exists
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if user has already liked this post
        existing_like = db.blog_likes.find_one({
            'post_id': post_id,
            'user_id': str(current_user['_id'])
        })
        
        if existing_like:
            # Unlike the post
            db.blog_likes.delete_one({
                'post_id': post_id,
                'user_id': str(current_user['_id'])
            })
            
            # Decrement likes count
            db.blog_posts.update_one(
                {'_id': ObjectId(post_id)},
                {'$inc': {'likes': -1}}
            )
            
            return jsonify({
                'success': True,
                'message': 'Post unliked',
                'liked': False
            })
        else:
            # Like the post
            db.blog_likes.insert_one({
                'post_id': post_id,
                'user_id': str(current_user['_id']),
                'created_at': datetime.datetime.utcnow()
            })
            
            # Increment likes count
            db.blog_posts.update_one(
                {'_id': ObjectId(post_id)},
                {'$inc': {'likes': 1}}
            )
            
            # Create notification for post author (if not self-like)
            if str(post.get('author_id', '')) != str(current_user['_id']):
                db.blog_notifications.insert_one({
                    'user_id': str(post['author_id']),
                    'post_id': post_id,
                    'type': 'like',
                    'actor_id': str(current_user['_id']),
                    'actor_name': current_user.get('name', 'Someone'),
                    'created_at': datetime.datetime.utcnow(),
                    'read': False
                })
            
            return jsonify({
                'success': True,
                'message': 'Post liked',
                'liked': True
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/comments/<comment_id>', methods=['PUT'])
@token_required
def update_blog_comment(comment_id, current_user=None):
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Check if comment exists
        comment = db.blog_comments.find_one({'_id': ObjectId(comment_id)})
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
            
        # Check if user is the author
        if str(comment.get('author_id', '')) != str(current_user['_id']):
            return jsonify({'error': 'Unauthorized to edit this comment'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Comment content is required'}), 400
        
        # Update the comment
        db.blog_comments.update_one(
            {'_id': ObjectId(comment_id)},
            {'$set': {
                'content': data.get('content'),
                'updated_at': datetime.datetime.utcnow()
            }}
        )
        
        # Get updated comment
        updated_comment = db.blog_comments.find_one({'_id': ObjectId(comment_id)})
        if updated_comment:
            updated_comment['_id'] = str(updated_comment['_id'])
            if updated_comment.get('author_id'):
                updated_comment['author_id'] = str(updated_comment['author_id'])
        
        return jsonify({
            'success': True,
            'message': 'Comment updated successfully',
            'comment': updated_comment
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Blog Management Endpoints
@app.route('/api/admin/blog/posts', methods=['GET'])
@admin_required
def admin_list_blog_posts():
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sortBy', 'created_at')
        sort_order = request.args.get('sortOrder', 'desc')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'content': {'$regex': search, '$options': 'i'}},
                {'category': {'$regex': search, '$options': 'i'}},
                {'author_name': {'$regex': search, '$options': 'i'}}
            ]
        
        # Validate sort field
        valid_sort_fields = ['created_at', 'title', 'likes', 'comments_count']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
            
        # Validate sort order
        sort_direction = -1 if sort_order == 'desc' else 1
        
        # Get total count
        total = db.blog_posts.count_documents(query)
        
        # Get posts with pagination and sorting
        skip = (page - 1) * limit
        posts = list(db.blog_posts.find(query)
                     .sort([(sort_by, sort_direction), ('created_at', -1)])
                     .skip(skip)
                     .limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for post in posts:
            post['_id'] = str(post['_id'])
            if post.get('author_id'):
                post['author_id'] = str(post['author_id'])
        
        return jsonify({
            'posts': posts,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/blog/posts/<post_id>', methods=['DELETE'])
@admin_required
def admin_delete_blog_post(post_id):
    try:
        # Check if post exists
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
            
        # Delete the post
        db.blog_posts.delete_one({'_id': ObjectId(post_id)})
        
        # Delete all comments for this post
        db.blog_comments.delete_many({'post_id': post_id})
        
        # Delete all likes for this post
        db.blog_likes.delete_many({'post_id': post_id})
        
        return jsonify({
            'success': True,
            'message': 'Blog post deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/blog/comments/<comment_id>', methods=['DELETE'])
@admin_required
def admin_delete_blog_comment(comment_id):
    try:
        # Check if comment exists
        comment = db.blog_comments.find_one({'_id': ObjectId(comment_id)})
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
            
        # Delete the comment
        db.blog_comments.delete_one({'_id': ObjectId(comment_id)})
        
        # Decrement comments count on the post
        db.blog_posts.update_one(
            {'_id': ObjectId(comment['post_id'])},
            {'$inc': {'comments_count': -1}}
        )
        
        return jsonify({
            'success': True,
            'message': 'Comment deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Blog Notifications Endpoints
@app.route('/api/blog/notifications', methods=['GET'])
@token_required
def get_notifications(current_user=None):
    """Get all notifications for current user"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        notifications = list(db.blog_notifications.find(
            {'user_id': str(current_user['_id'])}
        ).sort('created_at', -1).limit(50))
        
        for notif in notifications:
            notif['_id'] = str(notif['_id'])
        
        # Count unread notifications
        unread_count = sum(1 for n in notifications if not n.get('read', False))
        
        return jsonify({
            'notifications': notifications,
            'unread_count': unread_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/notifications/<notif_id>/read', methods=['PUT'])
@token_required
def mark_blog_notification_read(notif_id, current_user=None):
    """Mark blog notification as read"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        result = db.blog_notifications.update_one(
            {'_id': ObjectId(notif_id), 'user_id': str(current_user['_id'])},
            {'$set': {'read': True, 'read_at': datetime.datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Notification not found'}), 404
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/notifications/<notif_id>', methods=['DELETE'])
@token_required
def delete_blog_notification(notif_id, current_user=None):
    """Delete a blog notification"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        result = db.blog_notifications.delete_one(
            {'_id': ObjectId(notif_id), 'user_id': str(current_user['_id'])}
        )
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Notification not found'}), 404
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/notifications', methods=['DELETE'])
@token_required
def delete_all_blog_notifications(current_user=None):
    """Delete all blog notifications for current user"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        db.blog_notifications.delete_many(
            {'user_id': str(current_user['_id'])}
        )
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/my', methods=['GET'])
@token_required
def get_my_blog_posts(current_user=None):
    """Get all posts by current user"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = {'author_id': str(current_user['_id'])}
        
        total = db.blog_posts.count_documents(query)
        skip = (page - 1) * limit
        
        posts = list(db.blog_posts.find(query)
                    .sort('created_at', -1)
                    .skip(skip)
                    .limit(limit))
        
        for post in posts:
            post['_id'] = str(post['_id'])
            post['author_id'] = str(post['author_id'])
        
        return jsonify({
            'posts': posts,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Events Endpoints
@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all upcoming events"""
    try:
        # Get upcoming events (future dates) sorted by date
        current_time = datetime.datetime.utcnow()
        print(f"Current UTC time: {current_time}")
        events = list(db.events.find(
            {'date': {'$gte': current_time}}
        ).sort('date', 1))
        print(f"Found {len(events)} upcoming events")
        
        for event in events:
            event['_id'] = str(event['_id'])
            event_id = event['_id']
            
            # Calculate total attendees and check if event is full
            registrations = list(db.event_registrations.find({'event_id': event_id}))
            total_attendees = sum(reg.get('quantity', 1) for reg in registrations)
            event['total_attendees'] = total_attendees
            event['registration_count'] = len(registrations)
            
            # Check if event is full
            max_attendees = event.get('max_attendees', 0)
            if max_attendees and max_attendees > 0:
                event['is_full'] = total_attendees >= max_attendees
                event['available_slots'] = max(0, max_attendees - total_attendees)
            else:
                event['is_full'] = False
                event['available_slots'] = None
            
            # Convert datetime to string for JSON serialization
            if isinstance(event.get('date'), datetime.datetime):
                event['date'] = event['date'].isoformat()
            print(f"Event: {event['title']} - {event['date']}")
        
        return jsonify(events)
    except Exception as e:
        print(f"Error in get_events: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/events', methods=['GET'])
@admin_required
def admin_get_events(current_user=None):
    """Get all events (admin only) with registration counts"""
    try:
        events = list(db.events.find().sort('date', -1))
        
        # Get registration counts for each event
        for event in events:
            event['_id'] = str(event['_id'])
            event_id = event['_id']
            
            # Count registrations for this event
            registration_count = db.event_registrations.count_documents({'event_id': event_id})
            event['registration_count'] = registration_count
            
            # Calculate total attendees (sum of all quantities)
            registrations = list(db.event_registrations.find({'event_id': event_id}))
            total_attendees = sum(reg.get('quantity', 1) for reg in registrations)
            event['total_attendees'] = total_attendees
            
            # Convert datetime to string for JSON serialization
            if isinstance(event.get('date'), datetime.datetime):
                event['date'] = event['date'].isoformat()
        
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/events', methods=['POST'])
@admin_required
def create_event(current_user=None):
    """Create a new event (admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'date', 'location', 'venue']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse date - handle different formats
        try:
            if isinstance(data['date'], str):
                # Try to parse ISO format first
                if 'T' in data['date']:
                    event_date = datetime.datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
                else:
                    # Handle other formats if needed
                    event_date = datetime.datetime.fromisoformat(data['date'])
            else:
                event_date = data['date']
        except ValueError as ve:
            return jsonify({'error': f'Invalid date format: {str(ve)}'}), 400
        
        # Create event document
        event = {
            'title': data['title'],
            'description': data['description'],
            'date': event_date,
            'location': data['location'],
            'venue': data['venue'],
            'price': float(data.get('price', 0)),
            'image': data.get('image', ''),
            'max_attendees': int(data.get('max_attendees', 100)) if data.get('max_attendees') else 100,
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        result = db.events.insert_one(event)
        event['_id'] = str(result.inserted_id)
        # Convert datetime to string for JSON serialization
        if isinstance(event['date'], datetime.datetime):
            event['date'] = event['date'].isoformat()
        
        return jsonify(event), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/events/<event_id>', methods=['PUT'])
@admin_required
def update_event(event_id, current_user=None):
    """Update an existing event (admin only)"""
    try:
        data = request.get_json()
        
        # Update event document
        update_data = {
            'updated_at': datetime.datetime.utcnow()
        }
        
        # Only update fields that are provided
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'location' in data:
            update_data['location'] = data['location']
        if 'venue' in data:
            update_data['venue'] = data['venue']
        if 'image' in data:
            update_data['image'] = data['image']
        if 'date' in data:
            # Parse date - handle different formats
            try:
                if isinstance(data['date'], str):
                    # Try to parse ISO format first
                    if 'T' in data['date']:
                        update_data['date'] = datetime.datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
                    else:
                        # Handle other formats if needed
                        update_data['date'] = datetime.datetime.fromisoformat(data['date'])
                else:
                    update_data['date'] = data['date']
            except ValueError as ve:
                return jsonify({'error': f'Invalid date format: {str(ve)}'}), 400
        if 'price' in data:
            try:
                update_data['price'] = float(data['price'])
            except (ValueError, TypeError):
                pass  # Skip invalid price values
        if 'max_attendees' in data and data['max_attendees'] is not None:
            try:
                update_data['max_attendees'] = int(data['max_attendees'])
            except (ValueError, TypeError):
                pass  # Skip invalid max_attendees values
        
        result = db.events.update_one(
            {'_id': ObjectId(event_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Event not found'}), 404
            
        # Get updated event
        event = db.events.find_one({'_id': ObjectId(event_id)})
        if event is not None:
            event['_id'] = str(event['_id'])
            # Convert datetime to string for JSON serialization
            if isinstance(event.get('date'), datetime.datetime):
                event['date'] = event['date'].isoformat()
        
        return jsonify(event)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/events/<event_id>', methods=['DELETE'])
@admin_required
def delete_event(event_id, current_user=None):
    """Delete an event (admin only)"""
    try:
        result = db.events.delete_one({'_id': ObjectId(event_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Event not found'}), 404
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events/<event_id>/register', methods=['POST'])
@token_required
def register_event(event_id, current_user=None):
    """Register for an event"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        quantity = data.get('tickets', data.get('quantity', 1))
        attendee_name = data.get('attendee_name', current_user.get('name', ''))
        attendee_email = data.get('attendee_email', current_user.get('email', ''))
        attendee_phone = data.get('attendee_phone', current_user.get('phone', ''))
        
        # Get event
        event = db.events.find_one({'_id': ObjectId(event_id)})
        if not event:
            return jsonify({'error': 'Event not found'}), 404
            
        # Check if event is in the future
        if event['date'] < datetime.datetime.utcnow():
            return jsonify({'error': 'Cannot register for past events'}), 400
        
        # Check if event has reached maximum attendees
        max_attendees = event.get('max_attendees')
        if max_attendees and max_attendees > 0:
            # Calculate current total attendees
            registrations = list(db.event_registrations.find({'event_id': event_id}))
            total_attendees = sum(reg.get('quantity', 1) for reg in registrations)
            
            # Check if adding this registration would exceed the limit
            if total_attendees + quantity > max_attendees:
                available_slots = max(0, max_attendees - total_attendees)
                if available_slots == 0:
                    return jsonify({'error': 'Event is fully occupied. No slots available.'}), 400
                else:
                    return jsonify({'error': f'Only {available_slots} slot(s) available. Cannot register {quantity} attendee(s).'}), 400
            
        # Create registration
        registration = {
            'event_id': event_id,
            'user_id': str(current_user['_id']),
            'user_email': current_user['email'],
            'user_name': current_user.get('name', ''),
            'attendee_name': attendee_name,
            'attendee_email': attendee_email,
            'attendee_phone': attendee_phone,
            'quantity': quantity,
            'registration_date': datetime.datetime.utcnow(),
            'status': 'confirmed'
        }
        
        result = db.event_registrations.insert_one(registration)
        registration['_id'] = str(result.inserted_id)
        
        return jsonify(registration), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# This endpoint is deprecated as we're using registration instead of payment
@app.route('/api/events/bookings/<booking_id>/create-payment-order', methods=['POST'])
@token_required
def create_event_payment_order(booking_id, current_user=None):
    """This endpoint is deprecated. Use registration instead."""
    return jsonify({'error': 'Payment system is deprecated. Use registration instead.'}), 400

# This endpoint is deprecated as we're using registration instead of payment
@app.route('/api/events/bookings/<booking_id>/payment', methods=['POST'])
@token_required
def process_event_payment(booking_id, current_user=None):
    """This endpoint is deprecated. Use registration instead."""
    return jsonify({'error': 'Payment system is deprecated. Use registration instead.'}), 400

@app.route('/api/events/registrations/<registration_id>', methods=['GET'])
@token_required
def get_registration(registration_id, current_user=None):
    """Get registration details"""
    try:
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Get registration
        registration = db.event_registrations.find_one({'_id': ObjectId(registration_id)})
        if not registration:
            return jsonify({'error': 'Registration not found'}), 404
            
        # Get event details
        event = db.events.find_one({'_id': ObjectId(registration['event_id'])})
        if not event:
            return jsonify({'error': 'Event not found'}), 404
            
        # Get user details
        user = db.users.find_one({'_id': ObjectId(registration['user_id'])})
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Format response
        registration['_id'] = str(registration['_id'])
        event['_id'] = str(event['_id'])
        
        return jsonify({
            'registration': registration,
            'event': event,
            'user': {
                'name': user.get('name', ''),
                'email': user['email']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/events/registrations', methods=['GET'])
@admin_required
def admin_get_registrations(current_user=None):
    """Get all event registrations (admin only)"""
    try:
        # Get all registrations with event and user details
        registrations = list(db.event_registrations.find().sort('registration_date', -1))
        
        # Enrich with event and user details
        enriched_registrations = []
        for reg in registrations:
            reg['_id'] = str(reg['_id'])
            
            # Get event details
            event = db.events.find_one({'_id': ObjectId(reg['event_id'])})
            if event:
                reg['event_title'] = event.get('title', 'Unknown Event')
                reg['event_date'] = event.get('date')
            
            # Get user details
            user = db.users.find_one({'_id': ObjectId(reg['user_id'])})
            if user:
                reg['user_name'] = user.get('name', 'Unknown User')
                reg['user_email'] = user.get('email', '')
            
            enriched_registrations.append(reg)
        
        return jsonify(enriched_registrations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Weather-Based Crop Recommendation ---

OPENWEATHER_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY')

def get_current_season():
    month = datetime.datetime.now().month
    if 3 <= month <= 5: return "Spring"
    if 6 <= month <= 8: return "Summer"
    if 9 <= month <= 11: return "Monsoon"
    return "Winter"

def get_batch_crop_explanations(crops_list, weather_data):
    mistral_key = os.getenv('MISTRAL_API_KEY')
    if not mistral_key:
        return {}

    temp = weather_data['main']['temp']
    humidity = weather_data['main']['humidity']
    desc = weather_data['weather'][0]['description']
    
    # Construct a bulk prompt
    crops_str = ", ".join([f"{c['name']} ({c['suitability']})" for c in crops_list])
    
    prompt = (
        f"As a botanical expert for GreenCart, explain why these plants are suitable "
        f"for a climate with {temp}°C, {humidity}% humidity, and {desc}. "
        f"Plants: {crops_str}. "
        "Return the result ONLY as a JSON object where keys are the exact plant names given and values are short 1-sentence growth benefits. "
        "Example format: {\"Tomato\": \"Thrives in the warm temperature...\", \"Spinach\": \"...\"}"
    )

    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {mistral_key}'
        }
        payload = {
            'model': 'mistral-small-latest',
            'messages': [{'role': 'user', 'content': prompt}],
            'response_format': {'type': 'json_object'},
            'max_tokens': 300,
            'temperature': 0.7
        }
        
        response = requests.post('https://api.mistral.ai/v1/chat/completions', headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content'].strip()
            import json
            return json.loads(content)
    except Exception as e:
        print(f"Batch AI Explanation Error: {e}")
        return {}
        
    return {}

def get_dynamic_ai_suggestions(weather_data, current_season):
    mistral_key = os.getenv('MISTRAL_API_KEY')
    if not mistral_key:
        return []
    
    temp = weather_data['main']['temp']
    humidity = weather_data['main']['humidity']
    desc = weather_data['weather'][0]['description']
    city = weather_data.get('name', 'your area')

    prompt = (
        f"As a botanical expert for GreenCart, recommend 5 suitable crops for a garden in {city} "
        f"where it is currently {temp}°C, {humidity}% humidity, and {desc} in {current_season} season. "
        "Return the result ONLY as a JSON list of objects with these keys: "
        "name, type (Vegetable/Fruit/Herb/Flower), description, suitability (Highly Suitable/Moderately Suitable), "
        "care_tips (list), suitable_temp (object with min and max numbers), suitable_humidity (object with min and max numbers). "
        "Keep it professional and scientifically accurate."
    )

    try:
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {mistral_key}'}
        payload = {
            'model': 'mistral-small-latest',
            'messages': [{'role': 'user', 'content': prompt}],
            'response_format': {'type': 'json_object'}
        }
        res = requests.post('https://api.mistral.ai/v1/chat/completions', headers=headers, json=payload, timeout=8)
        if res.status_code == 200:
            content = res.json()['choices'][0]['message']['content'].strip()
            import json
            data = json.loads(content)
            # Find the list in the JSON object (Mistral might wrap it in a key like 'crops' or 'recommendations')
            for key in data:
                if isinstance(data[key], list):
                    return data[key]
            return []
    except Exception as e:
        print(f"AI Suggestion Error: {e}")
        pass
    return []

@app.route('/api/weather/recommend', methods=['GET'])
def recommend_crops():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        city = request.args.get('city')
        pincode = request.args.get('pincode')

        # Always refresh key in case .env was updated
        weather_key = os.getenv('OPENWEATHERMAP_API_KEY')

        if not weather_key:
            # Fallback for testing/demo if no API key is provided
            weather_data = {
                'main': {'temp': 28, 'humidity': 75},
                'weather': [{'description': 'clear sky', 'icon': '01d'}],
                'name': city or pincode or 'Mumbai'
            }
        else:
            weather_url = ""
            if lat and lon:
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_key}&units=metric"
            elif city:
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={weather_key}&units=metric"
            elif pincode:
                # Add ,in for Indian pincodes as the OWM zip param defaults to US
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?zip={pincode},in&appid={weather_key}&units=metric"
            else:
                return jsonify({'success': False, 'error': 'Location required'}), 400

            weather_res = requests.get(weather_url, timeout=5)
            if weather_res.status_code != 200:
                # If pincode with ,in failed, try without it just in case
                if pincode:
                    fallback_url = f"https://api.openweathermap.org/data/2.5/weather?zip={pincode}&appid={weather_key}&units=metric"
                    weather_res = requests.get(fallback_url, timeout=5)
                
                if weather_res.status_code != 200:
                    try:
                        owm_err = weather_res.json().get('message', 'Unknown provider error')
                    except:
                        owm_err = 'Could not parse error'
                    
                    return jsonify({
                        'success': False, 
                        'error': f'Weather API Error: {owm_err}',
                        'details': f'Search for "{city or pincode}" failed with status {weather_res.status_code}'
                    }), weather_res.status_code
            
            weather_data = weather_res.json()

        temp = weather_data['main']['temp']
        humidity = weather_data['main']['humidity']
        current_season = get_current_season()
        
        # Recommendation Logic: Fuzzy matching with scoring system
        # Fetch all crops to rank them (dataset is small enough)
        all_crops = list(crops_collection.find())
        recommended_crops = []
        
        for crop in all_crops:
            crop['id'] = str(crop['_id'])
            del crop['_id']
            
            score = 0
            # Temperature checks
            min_temp = crop.get('suitable_temp', {}).get('min', 0)
            max_temp = crop.get('suitable_temp', {}).get('max', 100)
            
            if min_temp <= temp <= max_temp:
                score += 40  # Perfect temp match
            else:
                # Penalty for deviation
                diff = min(abs(temp - min_temp), abs(temp - max_temp))
                if diff <= 5:
                    score += 20  # Close enough
                elif diff <= 10:
                    score += 5   # Margin of error
                else:
                    score -= 20  # Unsuitable
            
            # Humidity checks
            min_hum = crop.get('suitable_humidity', {}).get('min', 0)
            max_hum = crop.get('suitable_humidity', {}).get('max', 100)
            
            if min_hum <= humidity <= max_hum:
                score += 30  # Perfect humidity match
            else:
                diff = min(abs(humidity - min_hum), abs(humidity - max_hum))
                if diff <= 10:
                    score += 15
                elif diff <= 20:
                    score += 5
                else:
                    score -= 10

            # Season checks (Bonus)
            if current_season in crop.get('suitable_season', []):
                score += 30
            
            # Final assessment based on score
            # Final assessment based on score
            if score >= 30:
                crop['score'] = score
                crop['suitability_score'] = score
                
                if score >= 60:
                    crop['suitability'] = "Highly Suitable"
                else:
                    crop['suitability'] = "Moderately Suitable"

                # Check directly if a matching product exists
                product = products_collection.find_one({
                    'name': {'$regex': f'{crop["name"]}', '$options': 'i'},
                    'category': 'Seeds'
                })
                
                if product:
                    crop['productId'] = str(product['_id'])
                    crop['isAvailable'] = int(product.get('stock', 0)) > 0
                else:
                    crop['productId'] = None
                    crop['isAvailable'] = False

                recommended_crops.append(crop)
                
        # Generate explanations for the top crops (Batch Request)
        if recommended_crops:
            # Prepare list for batch request
            crops_to_explain = [
                {'name': c['name'], 'suitability': c['suitability']} 
                for c in recommended_crops[:5] # Limit to top 5 to avoid token limits
            ]
            
            # Batch AI Call
            try:
                processed_explanations = get_batch_crop_explanations(crops_to_explain, weather_data)
                
                # specific explanations to crops
                for crop in recommended_crops:
                    if crop['name'] in processed_explanations:
                        crop['explanation'] = processed_explanations[crop['name']]
                    else:
                         # Fallback if AI missed one
                        crop['explanation'] = f"Best suited for {crop['suitability']} growth in current {weather_data['main']['temp']}°C conditions."
            except Exception as e:
                print(f"Batch AI Error: {e}")
                # Global fallback
                for crop in recommended_crops:
                    crop['explanation'] = f"Compatible with current {weather_data['main']['temp']}°C temperature and humid conditions."

        # If results are low, fetch dynamic AI suggestions
        if len(recommended_crops) < 3:
            ai_suggestions = get_dynamic_ai_suggestions(weather_data, current_season)
            # Merge while avoiding duplicates
            existing_names = {c['name'].lower() for c in recommended_crops}
            for ai_crop in ai_suggestions:
                if ai_crop.get('name') and ai_crop['name'].lower() not in existing_names:
                    ai_crop['id'] = f"ai-{len(recommended_crops)}"
                    ai_crop['is_ai_generated'] = True
                    ai_crop['explanation'] = ai_crop.get('description', 'AI recommended for your unique climate.')
                    # Assign a basic score for sorting
                    ai_crop['suitability_score'] = 50 
                    ai_crop['suitability'] = ai_crop.get('suitability', "Moderately Suitable")
                    recommended_crops.append(ai_crop)

        # Sort by suitability score
        recommended_crops.sort(key=lambda x: x.get('suitability_score', 0), reverse=True)

        return jsonify({
            'success': True,
            'weather': {
                'temp': temp,
                'humidity': humidity,
                'city': weather_data.get('name'),
                'description': weather_data['weather'][0]['description'],
                'icon': weather_data['weather'][0]['icon'],
                'season': current_season
            },
            'recommendations': recommended_crops
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/weather/crops', methods=['GET'])
def get_all_crop_suitability():
    try:
        crops = list(crops_collection.find())
        for crop in crops:
            crop['id'] = str(crop['_id'])
            del crop['_id']
        return jsonify(crops)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

# Vercel requires this for serverless deployment
application = app
