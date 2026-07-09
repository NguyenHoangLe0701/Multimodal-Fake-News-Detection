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
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, 'model_weights', 'best_model_v2.pth')
    TEXT_MODEL_PATH = os.path.join(BASE_DIR, 'model_weights', 'text_model.pth')
    
    # OCR Config
    TESSERACT_CMD = os.getenv('TESSERACT_CMD', r'C:\Program Files\Tesseract-OCR\tesseract.exe')
    
    # Fake News Config
    COSINE_THRESHOLD = float(os.getenv('COSINE_THRESHOLD', '0.2'))
    

    # ── File Upload ────────────────────────────
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')