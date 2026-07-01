# Hướng Dẫn Đưa Dự Án Lên Mạng (Deploy)

Để đưa dự án của bạn lên mạng cho mọi người cùng sử dụng, chúng ta sẽ chia làm 2 phần: **Frontend (Web)** đưa lên **Vercel** và **Backend (API)** đưa lên **Render**.

---

## Phần 1: Đẩy code lên GitHub (Bắt buộc)
Cả Vercel và Render đều tự động lấy code từ GitHub để chạy.
1. Tạo một Repository (kho lưu trữ) mới trên GitHub.
2. Mở Terminal trong thư mục gốc của dự án (Multimodal-Fake-News-Detection) và chạy:
   ```bash
   git init
   git add .
   git commit -m "First commit"
   git branch -M main
   git remote add origin <LINK_GITHUB_CUA_BAN>
   git push -u origin main
   ```

---

## Phần 2: Đưa Backend (Flask) lên Render.com

> [!WARNING] Cảnh Báo Quan Trọng Về RAM (Dành cho AI)
> Máy chủ miễn phí của Render (Free Tier) **chỉ có 512MB RAM**. Thư viện `torch` và mô hình PhoBERT + ResNet50 cần tối thiểu **2GB - 4GB RAM**. 
> - Nếu bạn muốn deploy có mô hình AI thật: Bắt buộc phải mua gói trả phí của Render (gói Starter/Pro) hoặc dùng giải pháp chạy ngrok từ Google Colab.
> - Nếu bạn chỉ deploy giao diện với API giả lập (Mock): Render Free cân được thoải mái.

### Các bước thực hiện:
1. Truy cập [Render.com](https://render.com/) và đăng nhập bằng GitHub.
2. Bấm **New +** -> Chọn **Web Service**.
3. Chọn Repository dự án của bạn từ danh sách GitHub.
4. Cấu hình các thông số sau:
   - **Name**: `antifakenews-backend` (hoặc tên tùy ý)
   - **Root Directory**: `backend` *(Rất quan trọng, vì code python nằm trong thư mục backend)*
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && pip install gunicorn`
   - **Start Command**: `gunicorn run:app` (hoặc `python run.py` nếu không xài gunicorn).
5. Cuộn xuống phần **Environment Variables**, thêm các biến môi trường y hệt file `.env` của bạn:
   - `SUPABASE_URL`: <Link supabase của bạn>
   - `SUPABASE_KEY`: <Key supabase của bạn>
6. Bấm **Create Web Service**. Chờ khoảng 2-5 phút.
7. Khi thành công, Render sẽ cấp cho bạn một đường link (Ví dụ: `https://antifakenews-backend.onrender.com`). Hãy **copy link này lại**.

---

## Phần 3: Đưa Frontend (React/Vite) lên Vercel

1. Đăng nhập vào [Vercel.com](https://vercel.com/) bằng GitHub.
2. Bấm **Add New...** -> Chọn **Project**.
3. Chọn Repository dự án của bạn và bấm **Import**.
4. Cấu hình các thông số sau:
   - **Project Name**: `antifakenews`
   - **Framework Preset**: Chắc chắn Vercel tự nhận diện là **Vite**.
   - **Root Directory**: Bấm Edit và chọn thư mục `frontend`.
5. Mở phần **Environment Variables** ra, thêm biến môi trường để Web biết đường kết nối tới Backend:
   - Name: `VITE_API_URL`
   - Value: `<Đường link Render mà bạn vừa copy ở Bước 2>` *(Nhớ bỏ dấu / ở cuối link nhé)*
6. Bấm **Deploy** và chờ Vercel tung hoa rắc pháo!

## Phần 4: Hoàn thiện
- Vào lại Supabase, trong phần Authentication (nếu có dùng), thêm URL mà Vercel vừa cấp vào danh sách **Redirect URLs** (để tính năng đăng nhập được phép hoạt động trên tên miền mới).
- Truy cập vào trang web Vercel cấp cho bạn và trải nghiệm thành quả!
