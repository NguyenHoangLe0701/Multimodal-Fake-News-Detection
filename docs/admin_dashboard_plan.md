# Kế hoạch Triển khai Admin Dashboard (Task List)

**Trả lời câu hỏi của bạn:** RẤT NÊN làm Admin Dashboard. 
Đối với một đồ án hay dự án thực tế về AI, việc chỉ có giao diện cho User là chưa đủ. Một trang Admin Dashboard sẽ giúp đồ án của bạn "ăn điểm" tuyệt đối vì nó giải quyết bài toán vận hành thực tế: Thống kê hiệu suất AI, xem lịch sử dữ liệu người dùng nhập vào để đánh giá model, và quản lý hệ thống.

Dưới đây là Task List chi tiết nếu bạn quyết định làm thêm phần Admin Dashboard. Hãy đổi `[ ]` thành `[x]` khi hoàn thành.

---

## 1. Thiết kế Tính năng (Features)
- [ ] **Overview / Thống kê (Analytics):**
  - Hiển thị tổng số lượt check tin giả.
  - Tỉ lệ phần trăm FAKE vs REAL (Dùng biểu đồ tròn/Pie Chart).
  - Biểu đồ số lượng truy cập/check theo thời gian (Line Chart).
- [ ] **Quản lý Dữ liệu dự đoán (Prediction Logs):**
  - Bảng danh sách tất cả các tin tức + ảnh mà người dùng đã upload để check.
  - Xem được Confidence Score của AI.
  - (Tính năng nâng cao) Có nút "Report sai" hoặc "Confirm đúng" để admin duyệt lại kết quả của AI, từ đó thu thập data để sau này train lại model (Active Learning).
- [ ] **Quản lý Người dùng (Users Management):**
  - Bảng danh sách người dùng đã đăng ký.
  - Chức năng Block/Xóa tài khoản.

---

## 2. Thay đổi Database (Supabase)
- [ ] Thêm cột `role` vào bảng `users` (Giá trị: `admin` hoặc `user`). Mặc định khi đăng ký là `user`.
- [ ] Update tài khoản của bạn trong Supabase thành `role = 'admin'` để test.
- [ ] Thêm cột `admin_feedback` (boolean hoặc text) vào bảng `predictions` để Admin có thể đánh giá kết quả của AI đúng hay sai.

---

## 3. Triển khai Backend (Flask API cho Admin)
Cần tạo thêm một Blueprint riêng cho admin, ví dụ: `app/routes/admin.py`.
- [ ] **Middleware (Bảo mật):** Viết một decorator `@admin_required` để kiểm tra token JWT, đảm bảo chỉ `role == admin` mới được gọi các API này.
- [ ] **API Thống kê (`GET /api/admin/stats`):**
  - Trả về tổng số user, tổng số prediction, đếm số lượng FAKE/REAL.
- [ ] **API Quản lý Lịch sử (`GET /api/admin/predictions`):**
  - Trả về danh sách toàn bộ dự đoán của hệ thống (có phân trang/pagination).
- [ ] **API Đánh giá AI (`POST /api/admin/predictions/<id>/feedback`):**
  - Cho phép admin cập nhật lại kết quả đúng thực tế vào dòng log đó (phục vụ thu thập dataset sau này).
- [ ] **API Quản lý User (`GET /api/admin/users`, `DELETE /api/admin/users/<id>`):**
  - Xem danh sách và khóa tài khoản.

---

## 4. Triển khai Frontend (React - Admin UI)
- [ ] **Routing:** Cấu hình React Router cho các đường dẫn `/admin/*`.
  - Tạo layout riêng cho Admin (Có Sidebar bên trái, Header bên trên).
- [ ] **Bảo vệ Route (Protected Route):**
  - Nếu user không có quyền Admin mà vào `/admin`, tự động đá về trang chủ `/`.
- [ ] **Thư viện Biểu đồ:** Cài đặt `chart.js` và `react-chartjs-2` (hoặc `recharts`) để vẽ biểu đồ thống kê.
- [ ] **Trang Dashboard (`/admin/dashboard`):**
  - Giao diện gồm các Card thống kê nhanh (Tổng view, Tổng FAKE, Tổng REAL).
  - Hiển thị Pie chart và Line chart gọi data từ `GET /api/admin/stats`.
- [ ] **Trang Prediction Logs (`/admin/logs`):**
  - Dùng component Table (Ví dụ: Ant Design Table hoặc Material UI Table) để hiển thị danh sách các lần check tin.
  - Có các cột: Thumbnail Ảnh, Trích đoạn Text, Label (Fake/Real), Score, Ngày tháng.
- [ ] **Trang Users (`/admin/users`):**
  - Bảng danh sách user.

---

## 💡 Lợi ích mang lại nếu làm phần này
1. **Hoàn thiện luồng vận hành:** Chứng minh được dự án không chỉ chạy AI cho vui, mà có cơ chế lưu trữ, thống kê, và kiểm soát hệ thống.
2. **Hỗ trợ cực mạnh cho Machine Learning (Data Loop):** Lịch sử người dùng nhập vào chính là nguồn Dataset vô giá. Admin duyệt lại data này trên Dashboard, sau này bạn có thể export đống data đó ra file CSV để tiếp tục train nâng cấp model (Retraining/Fine-tuning).
