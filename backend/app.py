from flask import Flask, request, jsonify, send_file, send_from_directory
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

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(
    app,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
    supports_credentials=True,
)

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
        print(f"Login error: {e}") # Add more detailed logging
        return jsonify({
            'success': False,
            'error': str(e)
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
    return send_from_directory(UPLOAD_DIR, filename)

# Orders endpoints (basic list and status update)
@app.route('/api/orders', methods=['GET'])
@admin_required
def list_orders():
    try:
        items = []
        for o in orders_collection.find():
            items.append({
                'id': str(o['_id']),
                'customerName': o.get('customerName'),
                'total': float(o.get('total', 0)),
                'status': o.get('status', 'pending'),
                'createdAt': o.get('created_at', datetime.datetime.utcnow()),
            })
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
        status = data.get('status')
        # Mini project statuses
        if status not in ['pending', 'confirmed', 'delivered']:
            return jsonify({'error': 'Invalid status'}), 400
        orders_collection.update_one({'_id': ObjectId(order_id)}, {'$set': {'status': status}})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

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
            'paymentStatus': 'pending',
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        # Insert order
        result = orders_collection.insert_one(order_doc)
        
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
                try:
                    # Use getattr to safely access the order attribute
                    order = getattr(razorpay_client, 'order', None)
                    if order and hasattr(order, 'create'):
                        rzp_order = order.create(rzp_order_data)
                        rzp_order_id = rzp_order.get('id')
                    else:
                        return jsonify({'error': 'Razorpay order creation not available'}), 500
                except Exception as e:
                    return jsonify({'error': f'Failed to create Razorpay order: {str(e)}'}), 500
            except Exception as e:
                return jsonify({'error': f'Failed to create Razorpay order: {str(e)}'}), 500
        else:
            return jsonify({'error': 'Razorpay is not configured on server'}), 500

        # Save Razorpay order id
        orders_collection.update_one(
            {'_id': result.inserted_id},
            {'$set': {'razorpay_order_id': rzp_order_id}}
        )

        # Return order for Razorpay payment processing
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
        orders_collection.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'paymentStatus': 'completed', 'status': 'confirmed', 'razorpay_payment_id': razorpay_payment_id}}
        )

        # Reduce stock after payment is confirmed
        order = orders_collection.find_one({'_id': ObjectId(order_id)})
        if order and 'items' in order:
            reduce_stock_after_order(order['items'])

        return jsonify({'success': True, 'message': 'Payment verified successfully'})

    except Exception as e:
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
        
        # Convert ObjectId to string for JSON serialization
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
            notification['created_at'] = notification['created_at'].isoformat()
        
        return jsonify(notifications)
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
def get_feedback():
    try:
        # Check if user is admin
        token = request.headers.get('Authorization')
        if token:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user = db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not user or user.get('role') != 'admin':
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
def update_feedback_status(feedback_id):
    try:
        # Check if user is admin
        token = request.headers.get('Authorization')
        if token:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user = db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not user or user.get('role') != 'admin':
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
        
        # Build query
        query = {}
        if category:
            query['category'] = category
            
        # Get total count
        total = db.blog_posts.count_documents(query)
        
        # Get posts with pagination
        skip = (page - 1) * limit
        posts = list(db.blog_posts.find(query)
                     .sort('created_at', -1)
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
        
        # Get total count
        total = db.blog_posts.count_documents({})
        
        # Get posts with pagination
        skip = (page - 1) * limit
        posts = list(db.blog_posts.find()
                     .sort('created_at', -1)
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)

# Vercel requires this for serverless deployment
application = app
