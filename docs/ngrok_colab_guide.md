# Hướng Dẫn Deploy Backend (AI Thật) Bằng Ngrok Trên Google Colab

Vì các dịch vụ máy chủ miễn phí (như Render, Heroku) không đủ RAM và không có GPU để chạy mô hình Deep Learning của bạn, **cắm Backend chạy trực tiếp trên Google Colab và dùng Ngrok để dẫn link ra ngoài** là giải pháp hoàn hảo, hoàn toàn miễn phí, vô cùng thích hợp để mang lên giảng đường bảo vệ Đồ án tốt nghiệp!

---

## Bước 1: Lấy Token từ Ngrok
1. Truy cập [Ngrok.com](https://ngrok.com/) và đăng ký/đăng nhập 1 tài khoản miễn phí.
2. Tại màn hình chính (Dashboard), tìm đến mục **Your Authtoken** (hoặc `Getting Started` -> `Your Authtoken`).
3. Bạn sẽ thấy một đoạn mã rất dài (Ví dụ: `2Yxxxxxxx...`). Hãy copy đoạn mã đó lại.

## Bước 2: Đưa Backend lên Google Colab
1. Nén toàn bộ thư mục `backend/` (kèm theo thư mục `model_weights/` bên trong có file `model.pth` của bạn) thành 1 file ZIP.
2. Mở một sổ tay (Notebook) mới trên Google Colab, bật **GPU T4** ở phần cấu hình.
3. Tải file ZIP đó lên Colab và giải nén bằng lệnh:
   ```bash
   !unzip backend.zip
   ```

## Bước 3: Cài đặt thư viện cần thiết
Tạo một đoạn mã (Code cell) mới trên Colab và chạy:
```python
!pip install flask flask-cors python-dotenv supabase requests pillow torch torchvision transformers opencv-python numpy pyngrok
```

## Bước 4: Viết Script chạy Ngrok + Flask
Tạo một đoạn mã tiếp theo và dán đoạn code sau vào, nhớ thay mã AuthToken của bạn:

```python
from pyngrok import ngrok
import os
import subprocess
import time

# 1. Điền Authtoken của bạn vào đây
NGROK_AUTH_TOKEN = "ĐIỀN_TOKEN_NGROK_CỦA_BẠN_VÀO_ĐÂY"
ngrok.set_auth_token(NGROK_AUTH_TOKEN)

# 2. Khởi tạo đường hầm (Tunnel) trỏ vào cổng 5000 (của Flask)
public_url = ngrok.connect(5000).public_url
print("=========================================================")
print(f"🚀 PUBLIC API URL CỦA BẠN LÀ: {public_url}")
print("COPY LINK TRÊN ĐỂ DÁN VÀO VERCEL (VITE_API_URL) NHÉ!")
print("=========================================================")

# 3. Chạy Server Backend (Nhớ trỏ đúng đường dẫn tới run.py)
# Giả sử file run.py của bạn nằm trong thư mục backend/
os.chdir('backend')
!python run.py
```

## Bước 5: Kết nối với Frontend (Vercel)
1. Khi chạy đoạn code trên ở Bước 4, nó sẽ in ra một đường link dạng: `https://xxxx-xxx.ngrok-free.app`.
2. Truy cập vào trang quản trị Vercel (nơi bạn đã deploy Frontend React ở bài trước).
3. Vào **Settings** -> **Environment Variables**.
4. Chỉnh sửa biến `VITE_API_URL` bằng cái đường link ngrok bạn vừa lấy được.
5. Bấm **Redeploy** trên Vercel để web cập nhật link mới.

Xong! Bây giờ Web của bạn trên Vercel đã kết nối thẳng vào Não AI đang được cắm điện bằng con GPU xịn xò của Google Colab!

---

> [!WARNING] Nhược điểm Cốt lõi cần nhớ
> Link Ngrok sẽ thay đổi ngẫu nhiên và tắt máy mỗi khi bạn tắt trình duyệt hoặc Colab hết phiên làm việc (khoảng 12 tiếng). Mỗi lần bạn thuyết trình bảo vệ đồ án, bạn phải vào Colab chạy lại Bước 4 để lấy Link mới, rồi vào Vercel đổi lại biến môi trường là web sẽ sống lại!
