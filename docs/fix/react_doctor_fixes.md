# Báo cáo và khắc phục lỗi từ React Doctor

Dưới đây là chi tiết phân tích và cách xử lý các cảnh báo bảo mật và cấu hình mà hệ thống React Doctor (trên CI/CD) đã phát hiện.

## 1. Lỗi bảo mật: `Client writes Supabase authorization field` (`supabase-client-owned-authz-field`)

- **Vị trí báo lỗi:**
  - `src/pages/Login.jsx:31`
  - `src/pages/Register.jsx:60`
- **Nguyên nhân:** React Doctor phân tích và phát hiện Frontend đang cố gắng ghi đè trực tiếp các trường nhạy cảm về phân quyền (cụ thể là trường `role: 'user'` và `status: 'Active'`) vào cơ sở dữ liệu Supabase thông qua lệnh `supabase.from(...).insert(...)`. Trong kiến trúc bảo mật của Supabase, các trường liên quan đến phân quyền (Authorization fields như `role`, `status`) không bao giờ được phép ghi/insert trực tiếp từ Client (Frontend) vì người dùng có thể thao túng request.
- **Cách khắc phục:**
  - Đã loại bỏ hoàn toàn trường `role` và `status` khỏi các payload `insert` ở Frontend trong `Login.jsx` và `Register.jsx`.
  - Các trường `role` và `status` nên được thiết lập giá trị mặc định trực tiếp trên Schema của cơ sở dữ liệu Supabase (Default Value), hoặc thông qua Database Triggers.

## 2. Lỗi cấu hình: `require-reduced-motion` ở `package.json:0`

- **Vị trí báo lỗi:** `package.json:0`
- **Nguyên nhân:** React Doctor quét thấy dự án có cài đặt thư viện tạo hiệu ứng chuyển động (`framer-motion`) nhưng hệ thống dự án lại chưa có chuẩn mực hỗ trợ/buộc tôn trọng cài đặt hệ thống "Reduced Motion" của người dùng (tính năng hỗ trợ người bị rối loạn tiền đình, chóng mặt khi nhìn hiệu ứng quá nhanh).
- **Cách khắc phục:** Đã bọc toàn bộ ứng dụng bằng `<MotionConfig reducedMotion="user">` trong file `App.jsx`. Cấu hình này ra lệnh cho `framer-motion` tự động tắt hoàn toàn animation nếu trình duyệt/hệ điều hành người dùng đang bật chế độ "Prefer reduced motion".

## 3. Node.js 20 is deprecated (GitHub Actions Warning)

- Đây là cảnh báo từ môi trường GitHub Actions, không liên quan đến mã nguồn. GitHub đang nâng cấp môi trường chạy CI từ Node 20 lên Node 24. Bạn không cần lo lắng về cảnh báo này, chỉ cần nâng cấp Node version trong file workflow `.yml` nếu cần thiết.
