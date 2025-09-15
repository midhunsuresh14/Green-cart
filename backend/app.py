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

# Load environment variables
load_dotenv()

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
ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'}

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
                'price': float(p.get('price', 0)),
                'description': p.get('description', ''),
                'stock': int(p.get('stock', 0)),
                'imageUrl': p.get('imageUrl', ''),
            }
            if not q or q in (doc['name'] or '').lower() or q in (doc['category'] or '').lower():
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
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            return jsonify({'error': 'Invalid file type'}), 400
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)