"""
Supabase Service — Xử lý Database, Storage và Authentication.
Hỗ trợ Mock Data (Dữ liệu giả) nếu chưa cấu hình biến môi trường.
"""
import os
import uuid
from datetime import datetime, timezone
from config import Config

# ── Khởi tạo Supabase Client ──────────────────────────────────
_supabase = None
_initialized = False

def _get_client():
    """Khởi tạo Client Supabase (Chỉ chạy 1 lần)"""
    global _supabase, _initialized
    if _initialized:
        return _supabase

    _initialized = True

    if not Config.SUPABASE_URL or not Config.SUPABASE_KEY:
        print("[supabase_service] ⚠️ CẢNH BÁO: Chưa cấu hình SUPABASE_URL. Đang dùng Mock Data.")
        return None

    try:
        from supabase import create_client
        _supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        print("[supabase_service] ✅ Đã kết nối Supabase thành công.")
        return _supabase
    except Exception as e:
        print(f"[supabase_service] ❌ Lỗi kết nối Supabase: {e}")
        return None


# ── Authentication (Xác thực người dùng) ────────────────────────
def register_user(email, password):
    client = _get_client()
    if not client:
        return {"id": str(uuid.uuid4()), "email": email, "message": "Mock Registration Successful"}
    try:
        res = client.auth.sign_up({"email": email, "password": password})
        return {"id": res.user.id, "email": res.user.email}
    except Exception as e:
        return {"error": str(e)}

def login_user(email, password):
    client = _get_client()
    if not client:
        return {"access_token": "mock-jwt-token-123", "user": {"email": email, "id": "mock-uuid"}}
    try:
        res = client.auth.sign_in_with_password({"email": email, "password": password})
        return {"access_token": res.session.access_token, "user": {"email": res.user.email, "id": res.user.id}}
    except Exception as e:
        return {"error": str(e)}


# ── Storage (Lưu trữ ảnh trên RAM) ──────────────────────────────
def upload_image_bytes(file_bytes: bytes, file_name: str):
    """Nhận luồng byte từ FastAPI và đẩy thẳng lên Supabase"""
    client = _get_client()
    if not client:
        return ""

    try:
        client.storage.from_(Config.SUPABASE_BUCKET).upload(
            path=file_name,
            file=file_bytes,
            file_options={"content-type": "image/jpeg"}
        )
        return client.storage.from_(Config.SUPABASE_BUCKET).get_public_url(file_name)
    except Exception as e:
        print(f"[supabase_service] Lỗi Upload ảnh lên Supabase: {e}. Đang dùng Local Storage.")
        try:
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            local_path = os.path.join(Config.UPLOAD_FOLDER, file_name)
            with open(local_path, "wb") as f:
                f.write(file_bytes)
            # Trả về đường dẫn local tĩnh (đã được mount trong run.py)
            return f"/api/uploads/{file_name}"
        except Exception as local_e:
            print(f"[supabase_service] Lỗi lưu ảnh local: {local_e}")
            return ""


# ── Database (Bảng Predictions) ─────────────────────────────────
def save_prediction(news_text, image_url, label, confidence, text_score, image_score, user_email=""):
    record = {
        "news_text": news_text[:2000] if news_text else "no text context",
        "image_url": image_url,
        "prediction_label": label,
        "confidence_score": confidence,
        "text_score": text_score,
        "image_score": image_score,
        "user_email": user_email,
    }

    client = _get_client()
    if not client:
        return {
            **record,
            "id": uuid.uuid4().hex,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    try:
        result = client.table("predictions").insert(record).execute()
        if result.data:
            return result.data[0]
        return {**record, "id": "unknown", "created_at": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        print(f"[supabase_service] Lỗi lưu Database: {e}")
        return {**record, "id": "error", "created_at": datetime.now(timezone.utc).isoformat()}

def get_predictions(limit=20, user_email=None):
    client = _get_client()
    if not client:
        return [
            {
                "id": "mock-1",
                "news_text": f"Lịch sử giả lập của {user_email or 'bạn'}: Chuyên gia phát hiện UFO...",
                "prediction_label": "FAKE",
                "confidence_score": 0.98,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

    try:
        query = client.table("predictions").select("*")
        if user_email:
            query = query.eq("user_email", user_email)
        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"[supabase_service] Lỗi truy vấn Database: {e}")
        return []

def update_prediction_feedback(prediction_id, feedback):
    client = _get_client()
    if not client:
        return True # Mock success
    try:
        result = client.table("predictions").update({"admin_feedback": feedback}).eq("id", prediction_id).execute()
        return True
    except Exception as e:
        print(f"[supabase_service] Lỗi cập nhật feedback: {e}")
        return False

def get_dashboard_stats():
    client = _get_client()
    if not client:
        return {
            "total_users": 0,
            "total_predictions": 0,
            "fake_count": 0,
            "real_count": 0,
            "weekly_stats": []
        }
    
    try:
        # Count users
        res_users = client.table("users").select("*", count="exact").execute()
        total_users = res_users.count if res_users.count is not None else 0

        # Count predictions & labels
        res_preds = client.table("predictions").select("prediction_label", count="exact").execute()
        total_predictions = res_preds.count if res_preds.count is not None else 0
        
        fake_count = sum(1 for p in res_preds.data if p.get("prediction_label") == "FAKE")
        real_count = sum(1 for p in res_preds.data if p.get("prediction_label") == "REAL")

        # Get last 7 days for chart
        from datetime import datetime, timedelta, timezone
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        weekly_preds = client.table("predictions").select("prediction_label, created_at").gte("created_at", seven_days_ago).execute()
        
        # Group by day name (Mon, Tue, Wed, etc.)
        import collections
        weekly_data = collections.defaultdict(lambda: {"fake": 0, "real": 0})
        
        # Initialize last 7 days so they always show up
        for i in range(6, -1, -1):
            day_date = datetime.now(timezone.utc) - timedelta(days=i)
            day_name = day_date.strftime("%a")
            weekly_data[day_name] = {"fake": 0, "real": 0}

        for p in weekly_preds.data:
            dt = datetime.fromisoformat(p["created_at"].replace("Z", "+00:00"))
            day_name = dt.strftime("%a")
            label = p.get("prediction_label")
            if label == "FAKE":
                weekly_data[day_name]["fake"] += 1
            elif label == "REAL":
                weekly_data[day_name]["real"] += 1

        weekly_stats_list = [{"name": day, "fake": counts["fake"], "real": counts["real"]} for day, counts in weekly_data.items()]

        return {
            "total_users": total_users,
            "total_predictions": total_predictions,
            "fake_count": fake_count,
            "real_count": real_count,
            "weekly_stats": weekly_stats_list
        }

    except Exception as e:
        print(f"[supabase_service] Lỗi lấy thống kê: {e}")
        return {
            "total_users": 0,
            "total_predictions": 0,
            "fake_count": 0,
            "real_count": 0,
            "weekly_stats": []
        }