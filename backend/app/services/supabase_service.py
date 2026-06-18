"""
Supabase Service — handles database operations and file storage.

Falls back to mock data if Supabase credentials are not configured,
so the app won't crash during development without a Supabase project.
"""
import os
import uuid
from datetime import datetime, timezone
from config import Config


# ── Initialize Supabase client ──────────────────────────────────

_supabase = None
_initialized = False


def _get_client():
    """Lazy-initialize Supabase client. Returns None if not configured."""
    global _supabase, _initialized
    if _initialized:
        return _supabase

    _initialized = True

    if not Config.SUPABASE_URL or not Config.SUPABASE_KEY:
        print("[supabase_service] WARNING: SUPABASE_URL or SUPABASE_KEY not set. Using mock data.")
        return None

    try:
        from supabase import create_client
        _supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        print("[supabase_service] Connected to Supabase successfully.")
        return _supabase
    except Exception as e:
        print(f"[supabase_service] ERROR connecting to Supabase: {e}")
        return None


# ── Authentication ──────────────────────────────────────────────

def register_user(email, password):
    """Register a new user via Supabase Auth"""
    client = _get_client()
    if not client:
        return {"id": "mock-uuid", "email": email, "message": "Mock Registration Successful (Dev Mode)"}
    try:
        res = client.auth.sign_up({"email": email, "password": password})
        return {"id": res.user.id, "email": res.user.email}
    except Exception as e:
        return {"error": str(e)}

def login_user(email, password):
    """Log in a user via Supabase Auth"""
    client = _get_client()
    if not client:
        return {"access_token": "mock-jwt-token-12345", "user": {"email": email, "id": "mock-uuid"}}
    try:
        res = client.auth.sign_in_with_password({"email": email, "password": password})
        return {"access_token": res.session.access_token, "user": {"email": res.user.email, "id": res.user.id}}
    except Exception as e:
        return {"error": str(e)}


# ── Storage ─────────────────────────────────────────────────────

def upload_image(file_path, file_name):
    """
    Upload an image file to Supabase Storage.

    Args:
        file_path (str): Local path to the file.
        file_name (str): Target filename in the bucket.

    Returns:
        str: Public URL of the uploaded file, or empty string on failure.
    """
    client = _get_client()
    if not client:
        return ""

    try:
        with open(file_path, 'rb') as f:
            client.storage.from_(Config.SUPABASE_BUCKET).upload(
                path=file_name,
                file=f,
                file_options={"content-type": "image/jpeg"}
            )
        # Get public URL
        result = client.storage.from_(Config.SUPABASE_BUCKET).get_public_url(file_name)
        return result
    except Exception as e:
        print(f"[supabase_service] Upload error: {e}")
        return ""


# ── Database: predictions table ─────────────────────────────────

def save_prediction(news_text, image_url, label, confidence, text_score, image_score):
    """
    Save a prediction result to the 'predictions' table.

    Returns:
        dict: The saved record (with id and created_at), or a mock record.
    """
    record = {
        "news_text": news_text[:2000],  # Truncate very long text
        "image_url": image_url,
        "prediction_label": label,
        "confidence_score": confidence,
        "text_score": text_score,
        "image_score": image_score,
    }

    client = _get_client()
    if not client:
        # Return mock record for development
        return {
            **record,
            "id": uuid.uuid4().hex,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    try:
        result = client.table("predictions").insert(record).execute()
        if result.data:
            return result.data[0]
        return {**record, "id": "unknown", "created_at": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        print(f"[supabase_service] Save error: {e}")
        return {**record, "id": "error", "created_at": datetime.now(timezone.utc).isoformat()}


def get_predictions(limit=20):
    """
    Fetch recent predictions from the 'predictions' table.

    Returns:
        list[dict]: List of prediction records, newest first.
    """
    client = _get_client()
    if not client:
        # Return mock history for development
        return [
            {
                "id": "mock-1",
                "news_text": "Scientists discover new high-temperature superconductor material...",
                "image_url": "",
                "prediction_label": "REAL",
                "confidence_score": 0.92,
                "text_score": 0.88,
                "image_score": 0.50,
                "created_at": "2026-06-15T10:30:00Z",
            },
            {
                "id": "mock-2",
                "news_text": "BREAKING: Celebrity secretly controls world government...",
                "image_url": "",
                "prediction_label": "FAKE",
                "confidence_score": 0.87,
                "text_score": 0.91,
                "image_score": 0.82,
                "created_at": "2026-06-14T08:15:00Z",
            },
        ]

    try:
        result = (
            client.table("predictions")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data if result.data else []
    except Exception as e:
        print(f"[supabase_service] Query error: {e}")
        return []
