from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from PIL import Image
import io
import uuid

from config import Config
from app.services import ai_service, supabase_service

router = APIRouter()

async def _process_upload(image: Optional[UploadFile]) -> tuple[Optional[Image.Image], str]:
    if not image:
        return None, ""
        
    ext = image.filename.split('.')[-1].lower()
    if ext not in Config.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Định dạng ảnh không hợp lệ.")

    image_bytes = await image.read()
    if len(image_bytes) > Config.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước file vượt quá 10MB.")

    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    image_url = supabase_service.upload_image_bytes(image_bytes, unique_name) or ""
    
    return pil_image, image_url

def _resolve_analysis_mode(mode: str, text: str, has_image: bool) -> str:
    if mode != "auto":
        return mode
    has_text = bool(text.strip())
    if has_text and has_image:
        return "multimodal"
    if has_text:
        return "text"
    if has_image:
        return "image"
    return "auto"

@router.post("/", responses={400: {"description": "Lỗi định dạng ảnh hoặc dung lượng vượt mức"}, 500: {"description": "Lỗi hệ thống khi xử lý AI"}})
async def predict_fake_news(
    text: Optional[str] = Form(""), 
    image: Optional[UploadFile] = File(None), 
    user_email: str = Form(""),
    mode: str = Form("auto")
):
    """API Endpoint nhận văn bản hoặc ảnh hoặc cả 2 từ Frontend"""
    
    if not text.strip() and not image:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp văn bản hoặc hình ảnh.")

    pil_image, image_url = await _process_upload(image)
    resolved_mode = _resolve_analysis_mode(mode, text, bool(pil_image))

    # Giao dữ liệu cho Pipeline phân tích
    try:
        ai_result = ai_service.analyze(resolved_mode, text, pil_image)
        if "error" in ai_result:
            raise HTTPException(status_code=400, detail=ai_result["error"])
    except HTTPException:
        raise
    except Exception as e:
        print(f"[predict_route] Lỗi xử lý AI: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi xử lý AI.")

    # Lưu kết quả xuống database
    db_record = supabase_service.save_prediction(
        news_text=ai_result.get('original_text', '') or ai_result.get('extracted_text', ''),
        image_url=image_url,
        label=ai_result['label'],
        confidence=ai_result['confidence'],
        text_score=ai_result['text_score'] if isinstance(ai_result['text_score'], (int, float)) else None,
        image_score=ai_result['image_score'] if isinstance(ai_result['image_score'], (int, float)) else None,
        user_email=user_email
    )

    return {
        "status": "success",
        "data": {
            "id": db_record.get('id') if db_record else None,
            "label": ai_result['label'],
            "confidence": ai_result['confidence'],
            "reason": ai_result['reason'],
            "extracted_text": ai_result.get('extracted_text', ''),
            "original_text": ai_result.get('original_text', ''),
            "translated_text": ai_result.get('translated_text', ''),
            "text_score": ai_result['text_score'],
            "image_score": ai_result['image_score'],
            "image_url": image_url,
            "mode": resolved_mode,
            "text_model_available": ai_result.get('text_model_available', False)
        }
    }