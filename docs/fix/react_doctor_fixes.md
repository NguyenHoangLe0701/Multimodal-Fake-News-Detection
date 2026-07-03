# Báo cáo và khắc phục lỗi từ React Doctor

Dưới đây là chi tiết phân tích và cách xử lý các cảnh báo bảo mật và cấu hình mà hệ thống React Doctor (trên CI/CD) đã phát hiện.

## 1. Lỗi bảo mật: `Client writes Supabase authorization field` (`supabase-client-owned-authz-field`)

- **Vị trí báo lỗi:**
  - `src/pages/Login.jsx:31`
  - `src/pages/Register.jsx:60`
- **Nguyên nhân:** React Doctor phân tích và phát hiện Frontend đang cố gắng ghi đè trực tiếp các trường nhạy cảm về phân quyền (cụ thể là trường `role: 'user'`) vào cơ sở dữ liệu Supabase thông qua lệnh `supabase.from(...).insert(...)`. Trong kiến trúc bảo mật của Supabase, các trường liên quan đến phân quyền (Authorization fields như `role`) không bao giờ được phép ghi/insert trực tiếp từ Client (Frontend) vì người dùng có thể thao túng request để đổi `role` thành `admin`.
- **Cách khắc phục:** 
  - Đã loại bỏ hoàn toàn trường `role` khỏi các payload `insert` ở Frontend trong `Login.jsx` và `Register.jsx`.
  - Thay vào đó, trường `role` nên được thiết lập giá trị mặc định là `'user'` trực tiếp trên Schema của cơ sở dữ liệu Supabase (Default Value), hoặc thông qua Database Triggers để đảm bảo tính bảo mật tuyệt đối.

## 2. Cảnh báo/Lỗi cấu hình: `require-reduced-motion` ở `package.json:0`

- **Vị trí báo lỗi:** `package.json:0`
- **Nguyên nhân:** React Doctor quét thấy dự án có cài đặt thư viện tạo hiệu ứng chuyển động (`framer-motion`) nhưng hệ thống dự án lại chưa có chuẩn mực hỗ trợ/buộc tôn trọng cài đặt hệ thống "Reduced Motion" của người dùng (tính năng hỗ trợ người bị rối loạn tiền đình, chóng mặt khi nhìn hiệu ứng quá nhanh). Vì đây là lỗi cấu hình bao quát toàn dự án nên nó trỏ vào file gốc là `package.json:0`.
- **Cách khắc phục:** Lỗi này có thể tạm thời bỏ qua (hoặc chỉ mang tính chất warning về UX/Accessibility). Để giải quyết triệt để, chúng ta cần cấu hình bổ sung `<MotionConfig reducedMotion="user">` ở file root của React (ví dụ: `App.jsx` hoặc `main.jsx`) để `framer-motion` tự động cắt bỏ animation nếu trình duyệt/hệ điều hành người dùng đang bật chế độ giảm thiểu chuyển động.

## 3. Node.js 20 is deprecated (GitHub Actions Warning)

- Đây là cảnh báo từ môi trường GitHub Actions, không liên quan đến mã nguồn. GitHub đang nâng cấp môi trường chạy CI từ Node 20 lên Node 24. Bạn không cần lo lắng về cảnh báo này, chỉ cần nâng cấp Node version trong file workflow `.yml` nếu cần thiết.
