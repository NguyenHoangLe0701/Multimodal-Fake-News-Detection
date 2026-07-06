from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.supabase_service import get_predictions, update_prediction_feedback, get_dashboard_stats

router = APIRouter()

@router.get("/dashboard", summary="Lấy thông tin tổng quan (Thống kê)")
async def admin_dashboard():
    try:
        stats = get_dashboard_stats()
        return {
            "status": "success",
            "message": "Chào mừng đến với trang Quản trị",
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions", summary="Lấy lịch sử dự đoán cho Admin")
async def admin_get_predictions(limit: int = 50):
    try:
        # Gọi get_predictions với user_email=None để lấy toàn bộ
        data = get_predictions(limit=limit, user_email=None)
        return {
            "status": "success",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FeedbackRequest(BaseModel):
    feedback: str

@router.post("/predictions/{prediction_id}/feedback", summary="Admin gửi feedback Đúng/Sai")
async def admin_submit_feedback(prediction_id: str, req: FeedbackRequest):
    if req.feedback not in ["CORRECT", "INCORRECT"]:
        raise HTTPException(status_code=400, detail="Feedback không hợp lệ")
    
    success = update_prediction_feedback(prediction_id, req.feedback)
    if success:
        return {
            "status": "success",
            "message": "Đã lưu feedback",
            "data": {"id": prediction_id, "feedback": req.feedback}
        }
    else:
        raise HTTPException(status_code=500, detail="Lỗi khi lưu feedback")