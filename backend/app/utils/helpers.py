"""
Utility helpers for validation and response formatting.
"""
import os
import uuid
from flask import jsonify
from config import Config


def allowed_file(filename):
    """Check if file extension is in the allowed set."""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in Config.ALLOWED_EXTENSIONS


def generate_filename(original_name):
    """Generate a unique filename using UUID to prevent collisions."""
    ext = original_name.rsplit('.', 1)[1].lower() if '.' in original_name else 'jpg'
    return f"{uuid.uuid4().hex}.{ext}"


def success_response(data, status_code=200):
    """Standardized success response."""
    return jsonify({
        "status": "success",
        "data": data,
    }), status_code


def error_response(message, status_code=400):
    """Standardized error response."""
    return jsonify({
        "status": "error",
        "message": message,
    }), status_code


def ensure_upload_folder():
    """Create the upload folder if it doesn't exist."""
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
