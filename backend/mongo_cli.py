#!/usr/bin/env python3
"""
MongoDB CLI Tool for GreenCart
Simple command-line interface to interact with MongoDB database
"""

import sys
from pymongo import MongoClient
from bson import ObjectId
import json
from datetime import datetime

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "greencart"

def connect_to_db():
    """Connect to MongoDB and return database instance"""
    try:
        client = MongoClient(MONGO_URI)
        # Test connection
        client.admin.command('ping')
        db = client[DB_NAME]
        print(f"✅ Connected to MongoDB: {DB_NAME}")
        return db, client
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return None, None

def show_connection_info(db, client):
    """Display MongoDB connection information"""
    try:
        # Server info
        server_info = client.server_info()
        db_stats = db.command("dbstats")
        
        print("\n" + "="*50)
        print("📊 MONGODB CONNECTION INFO")
        print("="*50)
        print(f"🔗 Connection URI: {MONGO_URI}")
        print(f"🗄️  Database Name: {DB_NAME}")
        print(f"🖥️  MongoDB Version: {server_info['version']}")
        print(f"📦 Database Size: {db_stats.get('dataSize', 0) / 1024:.2f} KB")
        print(f"📁 Collections: {', '.join(db.list_collection_names())}")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error getting connection info: {e}")

def show_users(db):
    """Display all users in the database"""
    try:
        users_collection = db.users
        users = list(users_collection.find({}, {'password': 0}))  # Exclude passwords
        
        print("\n" + "="*80)
        print("👥 REGISTERED USERS")
        print("="*80)
        
        if not users:
            print("📭 No users found in the database")
            return
            
        print(f"📊 Total Users: {len(users)}")
        print("-"*80)
        
        for i, user in enumerate(users, 1):
            print(f"\n{i}. User ID: {user['_id']}")
            print(f"   👤 Name: {user.get('name', 'N/A')}")
            print(f"   📧 Email: {user.get('email', 'N/A')}")
            print(f"   📱 Phone: {user.get('phone', 'N/A')}")
            print(f"   🏷️  Role: {user.get('role', 'user')}")
            print(f"   📅 Created: {user.get('created_at', 'N/A')}")
            
        print("="*80)
        
    except Exception as e:
        print(f"❌ Error fetching users: {e}")

def search_user(db, email):
    """Search for a user by email"""
    try:
        users_collection = db.users
        user = users_collection.find_one({'email': email}, {'password': 0})
        
        if user:
            print(f"\n✅ User found:")
            print(f"   👤 Name: {user.get('name', 'N/A')}")
            print(f"   📧 Email: {user.get('email', 'N/A')}")
            print(f"   📱 Phone: {user.get('phone', 'N/A')}")
            print(f"   🏷️  Role: {user.get('role', 'user')}")
            print(f"   📅 Created: {user.get('created_at', 'N/A')}")
        else:
            print(f"❌ No user found with email: {email}")
            
    except Exception as e:
        print(f"❌ Error searching user: {e}")

def delete_user(db, email):
    """Delete a user by email"""
    try:
        users_collection = db.users
        
        # First check if user exists
        user = users_collection.find_one({'email': email})
        if not user:
            print(f"❌ No user found with email: {email}")
            return
            
        # Confirm deletion
        confirm = input(f"⚠️  Are you sure you want to delete user '{user.get('name')}' ({email})? (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Deletion cancelled")
            return
            
        # Delete user
        result = users_collection.delete_one({'email': email})
        if result.deleted_count > 0:
            print(f"✅ User {email} deleted successfully")
        else:
            print(f"❌ Failed to delete user {email}")
            
    except Exception as e:
        print(f"❌ Error deleting user: {e}")

def show_database_stats(db):
    """Show detailed database statistics"""
    try:
        db_stats = db.command("dbstats")
        users_collection = db.users
        
        print("\n" + "="*60)
        print("📈 DATABASE STATISTICS")
        print("="*60)
        print(f"📊 Database: {db.name}")
        print(f"📦 Data Size: {db_stats.get('dataSize', 0) / 1024:.2f} KB")
        print(f"🗂️  Storage Size: {db_stats.get('storageSize', 0) / 1024:.2f} KB")
        print(f"📁 Collections: {db_stats.get('collections', 0)}")
        print(f"📄 Objects: {db_stats.get('objects', 0)}")
        print(f"🔢 Indexes: {db_stats.get('indexes', 0)}")
        print(f"💾 Index Size: {db_stats.get('indexSize', 0) / 1024:.2f} KB")
        
        # User collection stats
        user_count = users_collection.count_documents({})
        print(f"\n👥 Users Collection:")
        print(f"   📊 Total Users: {user_count}")
        
        if user_count > 0:
            # Get user role distribution
            pipeline = [
                {"$group": {"_id": "$role", "count": {"$sum": 1}}}
            ]
            role_stats = list(users_collection.aggregate(pipeline))
            print(f"   🏷️  Role Distribution:")
            for role_stat in role_stats:
                print(f"      - {role_stat['_id']}: {role_stat['count']}")
                
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error getting database stats: {e}")

def show_help():
    """Display help information"""
    print("\n" + "="*60)
    print("🔧 GREENCART MONGODB CLI TOOL")
    print("="*60)
    print("Available commands:")
    print("  info          - Show connection information")
    print("  users         - List all users")
    print("  stats         - Show database statistics")
    print("  search <email> - Search for user by email")
    print("  delete <email> - Delete user by email")
    print("  help          - Show this help message")
    print("  exit          - Exit the CLI")
    print("="*60)

def main():
    """Main CLI loop"""
    print("🌱 GreenCart MongoDB CLI Tool")
    print("Type 'help' for available commands or 'exit' to quit")
    
    # Connect to database
    db, client = connect_to_db()
    if db is None:
        return
    
    # Show initial connection info
    show_connection_info(db, client)
    
    while True:
        try:
            command = input("\n🔧 greencart-db> ").strip().lower()
            
            if command == 'exit' or command == 'quit':
                print("👋 Goodbye!")
                break
            elif command == 'help':
                show_help()
            elif command == 'info':
                show_connection_info(db, client)
            elif command == 'users':
                show_users(db)
            elif command == 'stats':
                show_database_stats(db)
            elif command.startswith('search '):
                email = command.split(' ', 1)[1] if len(command.split(' ')) > 1 else ''
                if email:
                    search_user(db, email)
                else:
                    print("❌ Please provide an email address")
            elif command.startswith('delete '):
                email = command.split(' ', 1)[1] if len(command.split(' ')) > 1 else ''
                if email:
                    delete_user(db, email)
                else:
                    print("❌ Please provide an email address")
            elif command == '':
                continue
            else:
                print(f"❌ Unknown command: {command}")
                print("💡 Type 'help' for available commands")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Close connection
    if client:
        client.close()

if __name__ == "__main__":
    main()