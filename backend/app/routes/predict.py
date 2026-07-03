from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from PIL import Image
import io
import uuid

from config import Config
from app.services import ai_service, supabase_service

router = APIRouter()

@router.post("/", responses={400: {"description": "Lỗi định dạng ảnh hoặc dung lượng vượt mức"}, 500: {"description": "Lỗi hệ thống khi xử lý AI"}})
async def predict_fake_news(image: UploadFile = File(...), user_email: str = Form("")):
    """API Endpoint nhận duy nhất 1 bức ảnh từ Frontend"""
    
    ext = image.filename.split('.')[-1].lower()
    if ext not in Config.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Định dạng ảnh không hợp lệ.")

    image_bytes = await image.read()
    if len(image_bytes) > Config.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước file vượt quá 10MB.")

    # Nạp ảnh vào RAM dưới dạng đối tượng PIL
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Tùy chọn: Upload ảnh gốc lên Supabase để lưu trữ
    image_url = ""
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    upload_result = supabase_service.upload_image_bytes(image_bytes, unique_name)
    if upload_result:
        image_url = upload_result

    # Giao toàn bộ bức ảnh gốc cho Pipeline bóc tách và phân tích
    try:
        ai_result = ai_service.analyze_image_pipeline(pil_image)
    except Exception as e:
        print(f"[predict_route] Lỗi xử lý AI: {e}")
        raise HTTPException(status_code=500, detail="Lỗi xử lý bóc tách hoặc suy luận AI.")

    # Lưu kết quả xuống database
    db_record = supabase_service.save_prediction(
        news_text=ai_result['extracted_text'],
        image_url=image_url,
        label=ai_result['label'],
        confidence=ai_result['confidence'],
        text_score=ai_result['text_score'],
        image_score=ai_result['image_score'],
        user_email=user_email
    )

    return {
        "status": "success",
        "data": {
            "id": db_record.get('id') if db_record else None,
            "label": ai_result['label'],
            "confidence": ai_result['confidence'],
            "reason": ai_result['reason'],
            "extracted_text": ai_result['extracted_text'],
            "image_url": image_url
        }
    }