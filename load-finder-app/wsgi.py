"""
WSGI entry point for Render.com deployment
"""
from app_full_collector import app

if __name__ == "__main__":
    app.run()
