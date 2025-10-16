from flask import Flask
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route('/test')
def test():
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        return f"API Key loaded: {api_key[:20]}..."
    else:
        return "API Key not found"

if __name__ == '__main__':
    api_key = os.getenv('OPENAI_API_KEY')
    print(f"Before Flask app: API Key = {api_key[:20] if api_key else 'None'}")
    app.run(debug=True, port=5001)