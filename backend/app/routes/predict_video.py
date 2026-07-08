from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import os
import uuid
import shutil

from config import Config
from app.services import video_ai_service

router = APIRouter()

# Tạm thời lưu video vào thư mục uploads
UPLOAD_DIR = os.path.join(Config.UPLOAD_FOLDER, "videos")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", responses={400: {"description": "Lỗi định dạng video hoặc dung lượng"}, 500: {"description": "Lỗi hệ thống khi phân tích video"}})
def predict_fake_video(
    video: UploadFile = File(...), 
    user_email: str = Form("")
):
    """API Endpoint nhận video để phân tích Deepfake"""
    
    if not video:
        raise HTTPException(status_code=400, detail="Vui lòng tải lên một file video.")
        
    ext = video.filename.split('.')[-1].lower()
    allowed_exts = ["mp4", "webm", "ogg", "mov", "avi"]
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Định dạng video không hợp lệ. Hỗ trợ: {', '.join(allowed_exts)}.")

    # Tạo tên file ngẫu nhiên để tránh trùng
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    temp_video_path = os.path.join(UPLOAD_DIR, unique_name)
    
    try:
        # Lưu file video tạm ra ổ cứng để xử lý (không nên đưa hết vào RAM)
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
            
        # Kiểm tra dung lượng file (vd giới hạn 50MB)
        file_size = os.path.getsize(temp_video_path)
        if file_size > 50 * 1024 * 1024:
            os.remove(temp_video_path)
            raise HTTPException(status_code=400, detail="Kích thước video vượt quá giới hạn 50MB.")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"[predict_video_route] Lỗi lưu file: {e}")
        raise HTTPException(status_code=500, detail="Lỗi máy chủ khi lưu trữ video.")

    # Giao dữ liệu cho Pipeline phân tích
    try:
        ai_result = video_ai_service.analyze_video(temp_video_path)
        if "error" in ai_result:
            raise HTTPException(status_code=400, detail=ai_result["error"])
    except HTTPException:
        raise
    except Exception as e:
        print(f"[predict_video_route] Lỗi xử lý AI: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi xử lý video AI.")
    finally:
        # Dọn dẹp: Xóa file video tạm sau khi phân tích xong để tránh đầy ổ cứng
        if os.path.exists(temp_video_path):
            try:
                os.remove(temp_video_path)
            except Exception as e:
                print(f"[predict_video_route] Không thể xóa file tạm {temp_video_path}: {e}")

    # TODO: Bạn có thể lưu lịch sử kiểm tra (save_prediction) giống như ở file predict.py
    # db_record = supabase_service.save_prediction(...)
    
    return {
        "status": "success",
        "data": {
            "label": ai_result['label'],
            "confidence": ai_result['confidence'],
            "reason": ai_result['reason'],
            "videoScore": ai_result.get('videoScore'),
            "mode": ai_result.get('mode', 'video')
        }
    }
