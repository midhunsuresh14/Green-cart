#!/usr/bin/env python3
"""
Test script to verify Mistral API integration with GreenCart backend
"""

import os
import requests
import json

def test_mistral_integration():
    # Test the chatbot endpoint directly
    url = "http://localhost:5000/api/chatbot"
    
    # Sample conversation messages
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant for GreenCart, an e-commerce platform specializing in herbal remedies and medicinal plants."
        },
        {
            "role": "user", 
            "content": "What herbal remedies do you have for stress relief?"
        }
    ]
    
    payload = {
        "messages": messages
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing chatbot endpoint: {e}")
        return False

if __name__ == "__main__":
    print("Testing Mistral API integration with GreenCart backend...")
    
    # Check if MISTRAL_API_KEY is set
    api_key = os.getenv('MISTRAL_API_KEY')
    if not api_key:
        print("MISTRAL_API_KEY environment variable not set!")
        print("Please set it in your .env file:")
        print("MISTRAL_API_KEY=your_actual_api_key_here")
        exit(1)
    
    print(f"MISTRAL_API_KEY is set (length: {len(api_key)} characters)")
    
    # Test the integration
    success = test_mistral_integration()
    
    if success:
        print("\n✅ Mistral API integration test passed!")
    else:
        print("\n❌ Mistral API integration test failed!")
        print("Please check:")
        print("1. That the backend server is running (python app.py)")
        print("2. That your MISTRAL_API_KEY is correct")
        print("3. That you have internet connectivity")