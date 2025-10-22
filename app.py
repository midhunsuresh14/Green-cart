# Root level entrypoint for Vercel
# This file redirects to the backend application

import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the backend application
from backend.app import app

# Vercel expects the application to be named 'application'
application = app

# Add a simple health check endpoint
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'message': 'GreenCart backend is running'}

if __name__ == '__main__':
    app.run(debug=True)