from fastapi import APIRouter, Query, HTTPException
from app.services import supabase_service

router = APIRouter()

@router.get("/", summary="Lấy danh sách lịch sử kiểm tra tin giả", responses={500: {"description": "Lỗi truy xuất dữ liệu từ Database"}})
async def get_history(
    limit: int = Query(20, description="Số lượng bản ghi tối đa trả về", ge=1, le=100),
    email: str = Query(None, description="Email của user để lọc lịch sử")
):
    try:
        # Gọi service lấy dữ liệu từ Supabase
        history_data = supabase_service.get_predictions(limit=limit, user_email=email)
        
        return {
            "status": "success",
            "count": len(history_data),
            "data": history_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy xuất dữ liệu: {str(e)}")