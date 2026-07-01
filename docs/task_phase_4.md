# Lộ Trình Triển Khai Giai Đoạn 4: Đưa Mô Hình Vào Thực Tế (Production)

Đây là danh sách các công việc cụ thể bạn cần thực hiện để kết nối toàn bộ hệ thống lại với nhau bằng bộ dữ liệu thật.

## 1. Thu thập & Hợp nhất Dữ liệu
- [ ] Tải bộ dữ liệu tiêu chuẩn (ViFake hoặc UIT-ViSFD) chứa ít nhất 2000 bài báo.
- [ ] Chạy file `datasets/crawlers/vnexpress_crawler.py` và `datasets/prepare_train_data.py` để cào thêm 500 bài thời sự mới nhất.
- [ ] Dùng thư viện Pandas trộn 2 file CSV lại với nhau.
- [ ] Chia tỷ lệ dữ liệu: `Train (80%)` và `Validation (20%)`.

## 2. Huấn luyện Mô hình Thật trên Colab
- [ ] Tải toàn bộ tập Data lớn (`train.csv`, `val.csv`, và thư mục `images/`) lên Google Drive.
- [ ] Tải 2 file code (`models.py`, `data_loader.py`) lên Drive để tránh lỗi ModuleNotFound.
- [ ] Mở file `train.py` trên Colab và thiết lập siêu tham số mới:
  - `EPOCHS = 10`
  - `BATCH_SIZE = 16` (Hoặc `32` nếu Colab cấp RAM cao).
- [ ] Chạy lệnh `!python train.py`.
- [ ] Quan sát Loss giảm dần và Validation F1-Score vượt ngưỡng >80%.
- [ ] Tải file `model.pth` (Vừa được tạo ra ở thư mục `model_weights`) về máy tính cá nhân.

## 3. Lắp Não AI vào Backend
- [ ] Chép file `model.pth` vừa tải về vào thư mục `backend/model_weights/` của VS Code.
- [ ] Mở file `backend/app/services/ai_service.py`, kéo xuống phần **REAL Implementation**.
- [ ] Xóa bỏ toàn bộ các dấu `#` (uncomment) để hệ thống nhận diện file `model.pth`.
- [ ] Mở Terminal, trỏ vào thư mục `backend/` và gõ lệnh: `pip install -r requirements.txt` (Hệ thống sẽ tự động tải thư viện `torch` 2GB về để chạy AI).

## 4. Kiểm thử Thực tế (End-to-End Testing)
- [ ] Mở giao diện Frontend (`http://localhost:5173/detect`).
- [ ] Lên mạng tìm một bức ảnh có dấu hiệu lừa đảo và tải về.
- [ ] Tải ảnh lên Web, nhập đoạn văn bản đi kèm.
- [ ] Bấm **"TIẾN HÀNH KIỂM TRA"** và chiêm ngưỡng hệ thống phản hồi cực nhanh với độ chính xác cao!
