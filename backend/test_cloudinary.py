#!/usr/bin/env python3
"""
Test script to verify Cloudinary installation and import
"""

def test_cloudinary_import():
    """Test if cloudinary can be imported successfully"""
    try:
        import cloudinary
        import cloudinary.uploader
        import cloudinary.api
        print("✅ Cloudinary imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import Cloudinary: {e}")
        return False
    except Exception as e:
        print(f"❌ Error importing Cloudinary: {e}")
        return False

if __name__ == "__main__":
    print("Testing Cloudinary import...")
    success = test_cloudinary_import()
    if success:
        print("✅ Cloudinary is ready for use")
    else:
        print("❌ Cloudinary import failed")