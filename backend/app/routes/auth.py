from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services import supabase_service

router = APIRouter()

# Định nghĩa cấu trúc dữ liệu gửi lên
class UserCredentials(BaseModel):
    email: EmailStr # Tự động kiểm tra định dạng email hợp lệ
    password: str

@router.post("/register", summary="Đăng ký tài khoản mới")
async def register(credentials: UserCredentials):
    result = supabase_service.register_user(credentials.email, credentials.password)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return {
        "status": "success",
        "message": "Đăng ký thành công",
        "data": result
    }

@router.post("/login", summary="Đăng nhập hệ thống")
async def login(credentials: UserCredentials):
    result = supabase_service.login_user(credentials.email, credentials.password)
    
    if "error" in result:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác")
        
    return {
        "status": "success",
        "message": "Đăng nhập thành công",
        "data": result
    }