# Root level entrypoint for Vercel
# This file redirects to the backend application

import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the backend application
from backend.index import application

# Vercel expects the application to be named 'application'
app = application