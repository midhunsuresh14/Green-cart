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

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

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
reviews_collection = db.reviews
notifications_collection = db.notifications
otp_collection = db.otp_verifications

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
                'bars': [
                    {'stars': 5, 'count': 0},
                    {'stars': 4, 'count': 0},
                    {'stars': 3, 'count': 0},
                    {'stars': 2, 'count': 0},
                    {'stars': 1, 'count': 0},
                ],
                'items': []
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reviews', methods=['POST'])
@login_required
def create_review():
    try:
        user = get_current_user()
        data = request.get_json()
        
        product_id = data.get('productId')
        rating = data.get('rating')
        review_text = data.get('reviewText')
        user_name = data.get('userName') or user.get('name', 'Anonymous')
        
        # Validation
        if not product_id:
            return jsonify({'error': 'Product ID is required'}), 400
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        if not review_text or len(review_text.strip()) < 10:
            return jsonify({'error': 'Review text must be at least 10 characters'}), 400
        
        # Check if user already reviewed this product
        existing_review = reviews_collection.find_one({
            'productId': product_id,
            'userId': str(user['_id'])
        })
        
        if existing_review:
            return jsonify({'error': 'You have already reviewed this product'}), 400
        
        # Create review document
        review_doc = {
            'productId': product_id,
            'userId': str(user['_id']),
            'userName': user_name,
            'rating': rating,
            'reviewText': review_text.strip(),
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        # Insert review
        result = reviews_collection.insert_one(review_doc)
        
        # Return the created review
        return jsonify({
            'id': str(result.inserted_id),
            'name': user_name,
            'date': datetime.datetime.utcnow().strftime('%d/%m/%Y'),
            'text': review_text.strip(),
            'rating': rating,
            'image': None
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/create', methods=['POST'])
@login_required
def create_order():
    try:
        user = get_current_user()
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
                rzp_order = razorpay_client.order.create({
                    'amount': amount_paise,  # in paise
                    'currency': 'INR',
                    'receipt': str(result.inserted_id),
                    'payment_capture': 1,
                })
                rzp_order_id = rzp_order.get('id')
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
            razorpay_client.utility.verify_payment_signature(params_dict)
        except Exception as e:
            return jsonify({'success': False, 'error': f'Signature verification failed: {str(e)}'}), 400

        # Mark order as paid
        orders_collection.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'paymentStatus': 'completed', 'status': 'confirmed', 'razorpay_payment_id': razorpay_payment_id}}
        )

        return jsonify({'success': True, 'message': 'Payment verified successfully'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Stock Management Functions
def check_stock_and_notify(product_id, quantity_ordered):
    """Check stock levels and send admin notification if stock is low/out"""
    try:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            return False
        
        current_stock = product.get('stock', 0)
        new_stock = current_stock - quantity_ordered
        
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
        
        return new_stock >= 0
    except Exception as e:
        print(f"Error in stock check: {e}")
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)