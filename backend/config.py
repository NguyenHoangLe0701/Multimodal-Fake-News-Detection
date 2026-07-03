import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ── FastAPI ──────────────────────────────────
    DEBUG = os.getenv('API_DEBUG', 'false').lower() == 'true'

    # ── Supabase ───────────────────────────────
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
    SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET', 'images')

    # ── AI Model ───────────────────────────────
    # Đường dẫn tương đối trỏ về file pth
    MODEL_PATH = os.getenv('MODEL_PATH', '../training/models/best_model.pth')

    # ── File Upload ────────────────────────────
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}