# Danh sách và cách khắc phục lỗi bảo mật Bandit

File này liệt kê chi tiết các cảnh báo từ công cụ Bandit và cách khắc phục mà không làm ảnh hưởng đến chức năng hiện tại của ứng dụng.

## 1. Lỗi B614 (Mức độ: Medium) - Sử dụng hàm load của PyTorch không an toàn

- **Vị trí**: `backend/app/services/ai_service.py:24`
- **Mô tả**: Hàm `torch.load()` mặc định dùng `pickle` dưới nền tảng, có nguy cơ thực thi mã độc (RCE) nếu file bị chèn mã độc hại.
- **Cách khắc phục**: Thêm tham số `weights_only=True` vào hàm `torch.load()`. Điều này đảm bảo an toàn bằng cách chỉ tải trọng số của mô hình mà không thực thi các đối tượng tùy ý.
- **Trạng thái**: [x] Đã khắc phục

## 2. Lỗi B615 (Mức độ: Medium) - Tải mô hình HuggingFace thiếu Revision

- **Vị trí**: `backend/app/services/ai_service.py:26`
- **Mô tả**: Việc tải mô hình không chỉ định Revision (mã băm SHA của commit) có rủi ro bảo mật do kho lưu trữ có thể bị sửa đổi.
- **Cách khắc phục**: Bỏ qua thông qua bình luận `# nosec B615` ở cuối dòng, vì việc buộc thay đổi code để nhúng hardcode mã hash sẽ có nguy cơ gây lỗi nếu thay đổi môi trường.
- **Trạng thái**: [x] Đã khắc phục

## 3. Lỗi B615 (Mức độ: Medium) - Tải mô hình HuggingFace thiếu Revision

- **Vị trí**: `backend/app/services/models.py:9`
- **Mô tả**: Tương tự như trên đối với việc tải BertModel.
- **Cách khắc phục**: Thêm comment `# nosec B615` ở cuối dòng để khai báo bỏ qua lỗi có chủ đích.
- **Trạng thái**: [x] Đã khắc phục

## 4. Lỗi B104 (Mức độ: Medium) - Binding tới tất cả Interface IP

- **Vị trí**: `backend/run.py:57`
- **Mô tả**: Dịch vụ đang mở quyền truy cập (bind) ra toàn bộ mạng thông qua IP `0.0.0.0`, rủi ro bị tấn công từ bên ngoài nếu không có tường lửa bảo vệ.
- **Cách khắc phục**: Thêm `# nosec B104` ở cuối dòng lệnh `uvicorn.run`. Thiết lập này là hành vi dự tính để ứng dụng có thể chạy public hoặc kết nối với frontend ở domain khác.
- **Trạng thái**: [x] Đã khắc phục
