# Danh sách và cách khắc phục lỗi ESLint trên Frontend

File này liệt kê chi tiết các lỗi từ công cụ kiểm tra mã nguồn `eslint` trên Frontend và giải thích cách chúng được xử lý.

## 1. Lỗi khai báo biến/thành phần nhưng không sử dụng (`no-unused-vars`)

- **Vị trí bị ảnh hưởng:**
  - `src/App.test.jsx`: Biến `screen`, `expect`.
  - `src/components/Footer.jsx`: Hook `useEffect`, `useState`.
  - `src/components/Navbar.jsx`: Component icon `User`.
  - `src/components/auth/AuthLayout.jsx`: Prop `illustration`.
  - `src/pages/About.jsx`: Component icon `ShieldCheck`.
- **Nguyên nhân:** Import các modules, hàm, hoặc khai báo props nhưng không áp dụng ở bất kỳ dòng code nào trong file.
- **Cách khắc phục:** Xóa bỏ hoàn toàn những imports và props thừa để giữ mã nguồn sạch sẽ và tránh làm tăng dung lượng gói tin.

## 2. Lỗi kích hoạt render liên tiếp bằng `setState` trong `useEffect` (`react-hooks/set-state-in-effect`)

- **Vị trí bị ảnh hưởng:**
  - `src/components/Navbar.jsx` (Lấy User từ localStorage và đóng Mobile Menu)
  - `src/components/admin/AdminHeader.jsx` (Lấy User từ localStorage)
  - `src/components/admin/AdminSidebar.jsx` (Lấy User từ localStorage)
- **Nguyên nhân:** Gọi hàm `setState` một cách đồng bộ bên trong `useEffect` khiến React phải thực hiện chuỗi re-render không cần thiết (cascading renders), làm ảnh hưởng tới hiệu năng và có thể sinh ra nháy (flickering) UI.
- **Cách khắc phục:**
  - Khởi tạo giá trị trực tiếp ngay trong `useState`: Chuyển logic đọc `localStorage.getItem('user')` vào thẳng hàm callback khởi tạo của `useState`, ví dụ: `useState(() => JSON.parse(...))`. Việc này giúp loại bỏ `useEffect` vô nghĩa.
  - Về tính năng đóng Menu khi URL thay đổi: Có thể dùng comment `// eslint-disable-next-line react-hooks/set-state-in-effect` để tắt cảnh báo cục bộ, do logic ẩn Menu khi định tuyến là có chủ đích.

## 3. Lỗi tạo Component lồng nhau bên trong hàm render (`react-hooks/static-components`)

- **Vị trí bị ảnh hưởng:** `src/pages/admin/AdminDashboard.jsx` (Component `CustomTooltip`)
- **Nguyên nhân:** Component con (`CustomTooltip`) được định nghĩa ngay trong thân của component cha (`AdminDashboard`). Mỗi lần cha re-render, component con sẽ bị hủy và tạo lại (re-mount) hoàn toàn, làm mất trạng thái trước đó.
- **Cách khắc phục:** Đưa phần định nghĩa `const CustomTooltip = (...) => {...}` ra bên ngoài hàm `AdminDashboard` (lên cấp root của file).

## 4. Lỗi sử dụng hàm trước khi khai báo (`react-hooks/immutability`)

- **Vị trí bị ảnh hưởng:** `src/pages/admin/AdminLogs.jsx`
- **Nguyên nhân:** Hook `useEffect` gọi hàm `fetchLogs()` ngay từ dòng số 11, nhưng hàm này lại được định nghĩa phía dưới bằng cú pháp `const fetchLogs = ...`. Trong JavaScript, biến `const` không được "hoisting" (kéo lên đầu file) giống như từ khóa `function` truyền thống.
- **Cách khắc phục:** Di dời toàn bộ phần định nghĩa `const fetchLogs` lên phía trên hook `useEffect`.
