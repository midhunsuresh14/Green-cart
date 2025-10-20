import os
import shutil

# List of files and directories to remove
files_to_remove = [
    "backend/.env.bak",
    "backend/app_startup.log",
    "backend/test_email.py",
    "backend/test_env_in_app.py",
    "backend/test_flask_env.py",
    "backend/test_openai.py",
    "backend/test_products.py",
    "backend/test_sms.py",
    "test_api_fix.py",
    "test_chatbot.py",
    "test_chatbot_endpoint.py",
    "test_chatbot_improvements.py",
    "test_enhanced_chatbot.py",
    "test_mistral_integration.py",
    "test_products_api.py",
    ".zencoder"
]

directories_to_remove = [
    "backend/node_modules",
    "backend/venv",
    "backend/__pycache__"
]

def remove_files_and_directories():
    """Remove unnecessary files and directories"""
    print("Starting project cleanup...")
    
    # Remove individual files
    for file_path in files_to_remove:
        full_path = os.path.join(os.getcwd(), file_path)
        try:
            if os.path.exists(full_path):
                if os.path.isfile(full_path):
                    os.remove(full_path)
                    print(f"✓ Removed file: {file_path}")
                elif os.path.isdir(full_path):
                    shutil.rmtree(full_path)
                    print(f"✓ Removed directory: {file_path}")
            else:
                print(f"• File/Directory not found (skipped): {file_path}")
        except Exception as e:
            print(f"✗ Error removing {file_path}: {e}")
    
    # Remove directories recursively
    for dir_path in directories_to_remove:
        full_path = os.path.join(os.getcwd(), dir_path)
        try:
            if os.path.exists(full_path):
                shutil.rmtree(full_path)
                print(f"✓ Removed directory: {dir_path}")
            else:
                print(f"• Directory not found (skipped): {dir_path}")
        except Exception as e:
            print(f"✗ Error removing {dir_path}: {e}")
    
    # Remove all __pycache__ directories within backend/venv
    venv_path = os.path.join(os.getcwd(), "backend", "venv")
    if os.path.exists(venv_path):
        try:
            for root, dirs, files in os.walk(venv_path):
                for directory in dirs:
                    if directory == "__pycache__":
                        pycache_path = os.path.join(root, directory)
                        shutil.rmtree(pycache_path)
                        print(f"✓ Removed __pycache__ directory: {pycache_path}")
        except Exception as e:
            print(f"✗ Error removing __pycache__ directories: {e}")
    
    print("\nCleanup completed!")

if __name__ == "__main__":
    remove_files_and_directories()