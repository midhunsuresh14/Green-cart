from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db.users

# JWT Configuration
app.config['SECRET_KEY'] = 'greencart-secret-key-2024-secure-jwt-token'  # Change this to a secure secret key

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
def get_users():
    try:
        users = list(users_collection.find({}, {'password': 0}))  # Exclude passwords
        
        # Convert ObjectId to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
            
        return jsonify({
            'success': True,
            'users': users,
            'count': len(users)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching users: {str(e)}'
        }), 500

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
        
        # Hash the password
        hashed_password = generate_password_hash(password)
        
        # Create user document
        user_data = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'phone': phone,
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
            'message': 'User created successfully',
            'user_id': str(result.inserted_id),
            'token': token
        }), 201
        
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
                'phone': user['phone']
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': str(user['_id']),
                    'email': user['email'],
                    'name': user['name'],
                    'phone': user['phone'],
                    'created_at': user['created_at']
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)