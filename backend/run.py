import os
import sys

# 1. Cố định đường dẫn gốc để Python luôn tìm thấy file config.py (Quan trọng!)
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import Config
from app.services.ai_service import _load_model

# 2. Import các Router (Đã dọn dẹp các dòng trùng lặp)
from app.routes.predict import router as predict_router
from app.routes.auth import router as auth_router
from app.routes.history import router as history_router
from app.routes.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Dang khoi dong Server FastAPI...")
    # Tải mô hình AI vào RAM ngay khi bật server
    _load_model()
    print("Server da san sang nhan Request!")
    yield
    print("Dang tat Server và giai phong RAM...")

app = FastAPI(
    title="Multimodal Fake News API",
    description="Hệ thống phát hiện tin giả bằng AI Đa phương thức",
    lifespan=lifespan,
    debug=Config.DEBUG
)

# Cấu hình CORS cho Frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# 3. Đăng ký Router (Mỗi router 1 đường dẫn duy nhất)
app.include_router(predict_router, prefix="/api/predict", tags=["AI Prediction"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(history_router, prefix="/api/history", tags=["History"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Dashboard"])

# Mount folder lưu ảnh local fallback
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=Config.UPLOAD_FOLDER), name="uploads")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "FastAPI Backend is running!"}

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("run:app", host=host, port=8000, reload=True)