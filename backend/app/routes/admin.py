from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard", summary="Lấy thông tin tổng quan (Thống kê)")
async def admin_dashboard():
    # TODO: Kết nối Supabase để đếm tổng số User và tổng số Prediction
    return {
        "status": "success",
        "message": "Chào mừng đến với trang Quản trị",
        "stats": {
            "total_users": 0, # Thay bằng dữ liệu thực sau
            "total_predictions": 0,
            "fake_news_detected": 0
        }
    }