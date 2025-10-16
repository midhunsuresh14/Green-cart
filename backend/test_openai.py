import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_connection():
    """Test OpenAI connection with the API key from .env"""
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("❌ OPENAI_API_KEY not found in .env file")
        print("Please add your OpenAI API key to the .env file:")
        print("OPENAI_API_KEY=sk-your_openai_api_key_here")
        return False
    
    # Check if the key is properly uncommented (doesn't start with #)
    if api_key.startswith('#'):
        print("❌ OPENAI_API_KEY is commented out in .env file")
        print("Please remove the # at the beginning of the line")
        return False
    
    # Check if it's still the placeholder value
    if api_key == 'sk-your_actual_openai_api_key_here':
        print("❌ OPENAI_API_KEY is still the placeholder value")
        print("Please replace 'sk-your_actual_openai_api_key_here' with your actual API key")
        return False
    
    try:
        # Initialize OpenAI client
        client = openai.OpenAI(api_key=api_key)
        
        # Test the API with a simple request
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello, this is a test message. Please respond with 'Test successful'."}
            ],
            max_tokens=50
        )
        
        print("✅ OpenAI API connection successful!")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except openai.AuthenticationError:
        print("❌ Invalid OpenAI API key")
        print("Please check your API key in the .env file")
        return False
    except openai.APIError as e:
        print(f"❌ OpenAI API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing OpenAI API connection...")
    print("================================")
    test_openai_connection()
    print("================================")
    print("If you're seeing this message, please check the .env file:")
    print("1. Make sure the OPENAI_API_KEY line is not commented out (no # at the beginning)")
    print("2. Make sure you've replaced the placeholder with your actual API key")
    print("3. Make sure to restart the backend server after making changes")