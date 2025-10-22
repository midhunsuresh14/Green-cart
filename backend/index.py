# Vercel entrypoint for Flask app
from app import app

# Vercel requires this for serverless deployment
application = app

if __name__ == "__main__":
    app.run(debug=True)