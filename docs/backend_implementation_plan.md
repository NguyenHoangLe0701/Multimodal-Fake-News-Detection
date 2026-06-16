# Kế hoạch Triển khai Backend (Flask) Chi tiết - Task List

Dưới đây là danh sách các công việc (Task List) để xây dựng bộ khung Backend hoàn chỉnh. Mọi module phải hoạt động được từ đầu đến cuối (End-to-End) với một **AI Model giả lập (Mock AI)**.

Khi bạn hoàn thành việc nào, hãy thay đổi `[ ]` thành `[x]` để đánh dấu hoàn thành.

---

## 1. Khởi tạo Dự án & Kiến trúc (Skeleton)
- [ ] Khởi tạo môi trường ảo Python (`python -m venv venv`) và activate.
- [ ] Cài đặt các thư viện cơ bản: `Flask`, `flask-cors`, `python-dotenv`, `gunicorn`, `supabase`.
- [ ] Tạo file `requirements.txt` để lưu lại thư viện (`pip freeze > requirements.txt`).
- [ ] Khởi tạo Flask App theo mẫu App Factory trong `app/__init__.py`.
- [ ] Cấu hình CORS để Frontend gọi API không bị lỗi.
- [ ] Setup file `.env` chứa các key: `SUPABASE_URL`, `SUPABASE_KEY`, `FLASK_APP`.
- [ ] Tạo cấu trúc thư mục Blueprints:
  - `app/routes/auth.py`
  - `app/routes/predict.py`
  - `app/routes/history.py`
- [ ] Đăng ký các Blueprints này vào app chính trong `__init__.py`.

---

## 2. Tích hợp Supabase (Database & Storage)
- [ ] Truy cập Supabase, tạo project mới và lấy URL, API Key.
- [ ] **Storage:** Tạo bucket tên là `news-images` và set quyền Public.
- [ ] **Database:** Tạo bảng `users` (nếu không dùng auth mặc định) và bảng `predictions` gồm các cột: `id`, `user_id`, `news_text`, `image_url`, `prediction_label`, `confidence_score`, `created_at`.
- [ ] Tạo file `app/services/db_service.py` để kết nối Supabase bằng `supabase-py`.
- [ ] Viết hàm Upload hình ảnh lên Storage (trả về Public URL).
- [ ] Viết hàm Insert một dòng dự đoán vào bảng `predictions`.
- [ ] Viết hàm Query lấy lịch sử dự đoán dựa theo user.

---

## 3. Xây dựng Mock AI Service (Cốt lõi để tách biệt AI)
- [ ] Tạo file `app/services/ai_service.py`.
- [ ] Viết hàm `def predict_fake_news(text, image_url):` nhận dữ liệu đầu vào.
- [ ] Viết logic "giả lập" (Mocking) bên trong hàm này:
  - Sinh ngẫu nhiên độ tin cậy (`confidence`) từ 0.0 đến 1.0.
  - Phân loại `FAKE` hoặc `REAL` dựa trên mốc (threshold) hoặc ngẫu nhiên.
  - Trả về Dictionary kết quả: `{"label": "FAKE", "confidence": 0.85}`.
*(Tương lai: Khi có file `.pth` đã train xong, bạn chỉ việc vào đây sửa hàm này thành code PyTorch thật)*

---

## 4. Xây dựng RESTful API Endpoints
- [ ] **API `/api/predict` (POST) trong `predict.py`:**
  - Nhận `multipart/form-data` chứa chuỗi `text` và file `image`.
  - Gọi hàm Upload ảnh lên Supabase từ `db_service.py` lấy URL.
  - Truyền `text` và URL vào `ai_service.predict_fake_news()` lấy kết quả Mock.
  - Gọi hàm Insert vào Database lưu lại lịch sử.
  - Trả về JSON chứa kết quả cho Frontend.
- [ ] **API `/api/history` (GET) trong `history.py`:**
  - Lấy thông tin user (từ Token hoặc param).
  - Gọi `db_service` để query bảng `predictions`.
  - Trả về JSON mảng lịch sử.
- [ ] **API `/api/auth/login` (POST) trong `auth.py` (Tuỳ chọn):**
  - Tương tác với Supabase Auth nếu dự án yêu cầu đăng nhập.

---

## 5. Xử lý lỗi (Error Handling) & Logging
- [ ] Định nghĩa `errorhandler` ở level App (bắt lỗi 400, 404, 500) trả về JSON thống nhất `{"error": "message"}`.
- [ ] Cài đặt Logging cơ bản để in lỗi ra console khi upload ảnh hoặc gọi Mock AI bị tịt.

---

## 6. Sẵn sàng Deploy
- [ ] Viết file `run.py` ở thư mục gốc để khởi động server bằng `python run.py`.
- [ ] Cấu hình chuẩn bị deploy lên Render / Railway (có file Gunicorn run command).
- [ ] Cập nhật lại README.md hướng dẫn run Flask nếu cần.
- [ ] Commit toàn bộ nhánh Backend này lên Github!

---

## 🔥 Quy trình Tương lai (Khi bắt tay vào làm AI)
- [ ] Tìm Dataset (Kaggle/Mendeley).
- [ ] Code Jupyter Notebook train Pytorch (Text + Image).
- [ ] Export file `best_model.pth`.
- [ ] Bỏ file `.pth` vào backend thư mục `app/ai_core/weights/`.
- [ ] Mở file `ai_service.py`, xóa cái hàm Mock AI đi.
- [ ] Viết hàm mới import model PyTorch và chạy inference dựa trên file `.pth`.
- [ ] Hoàn tất toàn bộ đồ án!
