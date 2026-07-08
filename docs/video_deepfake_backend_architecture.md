# Kiến Trúc Backend cho Hệ Thống Phân Tích Video Deepfake

Tài liệu này mô tả chi tiết luồng xử lý (pipeline) và các logic cần thiết để tích hợp mô hình phân tích Video Deepfake đã được huấn luyện vào hệ thống Backend (BE).

Do đặc thù xử lý video tốn rất nhiều tài nguyên (CPU/GPU/RAM) và thời gian hơn so với xử lý ảnh hoặc văn bản tĩnh, BE cần được thiết kế theo một pipeline bóc tách và phân luồng rõ ràng.

---

## 1. Xử lý Upload & Tiếp nhận File (API Endpoint)

Video thường có dung lượng lớn, nên API tiếp nhận cần được cấu hình chuẩn:

- **Kiểm tra định dạng & dung lượng**: 
  - Chỉ cho phép các định dạng video chuẩn (VD: `video/mp4`, `video/webm`, `video/quicktime`). 
  - Giới hạn dung lượng upload (ví dụ: max 50MB hoặc 100MB) để tránh làm quá tải server.
- **Lưu trữ tạm thời (Temp Storage)**: 
  - Khi tiếp nhận file từ Frontend, lưu video tạm thời vào ổ cứng máy chủ hoặc thư mục temp (ví dụ: `/tmp/` trên Linux). 
  - **Lưu ý quan trọng**: Tuyệt đối không nạp (load) toàn bộ file video trực tiếp vào RAM để xử lý, vì nhiều requests đồng thời sẽ gây sập server do hết bộ nhớ.

---

## 2. Tiền xử lý Video (Video Preprocessing Pipeline)

Đây là bước cực kỳ quan trọng quyết định độ chính xác và tốc độ xử lý của hệ thống. Bạn không thể đưa nguyên cả file video gốc vào AI model, mà phải bóc tách dữ liệu theo không gian (hình ảnh) và thời gian (âm thanh/khung hình):

### A. Trích xuất khung hình (Frame Extraction)
Sử dụng thư viện như `OpenCV` (`cv2`) hoặc `FFmpeg` để cắt video thành các khung hình tĩnh (frames).
- **Tối ưu tốc độ**: Không nên lấy tất cả các frame. Ví dụ một video 30fps dài 1 phút có tới 1800 frames. Việc xử lý cả 1800 frames sẽ vô cùng chậm. 
- **Giải pháp**: Cấu hình trích xuất cách quãng. Ví dụ: lấy 1 frame mỗi giây (1 FPS), hoặc lấy ngẫu nhiên 30-50 frames trải đều từ đầu đến cuối video.

### B. Phát hiện và Cắt khuôn mặt (Face Detection & Cropping)
Các model nhận diện deepfake hiện đại đa số tập trung tìm kiếm dấu vết can thiệp (artifacts) trên khuôn mặt. 
- Sử dụng các thư viện như `MTCNN`, `RetinaFace`, hoặc `MediaPipe` để quét các frames vừa trích xuất.
- Tìm vị trí khuôn mặt và cắt (crop) riêng vùng khuôn mặt đó ra.
- Thay đổi kích thước (Resize) khung hình khuôn mặt về đúng định dạng đầu vào mà model yêu cầu (thường là `224x224` hoặc `256x256` pixel).

### C. Trích xuất âm thanh (Audio Extraction - Tùy chọn)
Nếu hệ thống hoặc model của bạn phân tích cả giọng nói giả (Voice cloning) hoặc sự không đồng bộ nhịp miệng (Lip-sync):
- Sử dụng `FFmpeg` hoặc `librosa` để tách file `.wav` từ video.
- Trích xuất đặc trưng phổ âm thanh (Spectrogram hoặc MFCC) để làm đầu vào cho model âm thanh.

---

## 3. Logic Đưa vào Model (Model Inference)

### A. Batch Processing (Xử lý theo lô)
- Gộp các hình ảnh khuôn mặt đã cắt (ví dụ: 30 khuôn mặt từ 30 frames) thành một "Batch" duy nhất. 
- Ví dụ tạo ra một Tensor có kích thước `[30, 3, 224, 224]`.
- Đẩy toàn bộ Batch này qua GPU/CPU để xử lý một lần cho nhanh, thay vì gọi hàm `model.predict()` 30 lần riêng biệt.

### B. Tổng hợp kết quả (Score Aggregation)
Model sẽ trả về xác suất Fake/Real cho **từng frame**. Logic Backend cần tổng hợp lại thành một kết quả duy nhất cho toàn bộ video:
- **Tính trung bình (Average)**: Lấy trung bình cộng xác suất của tất cả các frames.
- **Cơ chế biểu quyết (Voting/Thresholding)**: Nếu có hơn `X%` số frame bị đánh giá là FAKE (xác suất > `0.8`) thì kết luận toàn bộ video là FAKE. Điều này cực kỳ hữu ích để phát hiện các đoạn deepfake siêu ngắn bị chèn tinh vi ở giữa một video thật.

---

## 4. Hậu xử lý & Định dạng API Response

Dựa trên kết quả tổng hợp, Backend cần tạo ra JSON response đúng chuẩn mà Frontend đang mong đợi. Cấu trúc JSON nên tương thích với các dữ liệu mà Frontend hiện tại (`DetectVideo.jsx`) đang dùng để render UI:

```json
{
  "status": "success",
  "data": {
    "label": "FAKE",                 // Kết luận cuối cùng: "FAKE" hoặc "REAL"
    "confidence": 0.95,              // Độ tin cậy tổng (0.0 đến 1.0)
    "videoScore": 0.98,              // Điểm bất thường của hình ảnh/khuôn mặt
    "audioScore": 0.15,              // Điểm bất thường của âm thanh (nếu có model audio)
    "reason": "Phát hiện sự bất thường ở vùng mắt và sự không đồng bộ khẩu hình miệng từ giây 12 đến 15.",
    "mode": "video"
  }
}
```

---

## 5. Kiến trúc Xử lý Bất đồng bộ (Khuyên dùng cho Production)

Vì luồng "Upload -> Trích xuất Frame -> Cắt mặt -> Chạy AI Model" có thể tốn từ `5` đến `30` giây (tùy thuộc vào phần cứng và độ dài video), nếu bạn để HTTP Request đợi lâu như vậy, kết nối rất dễ bị **Timeout** và sập trải nghiệm người dùng.

### Giải pháp
Sử dụng mô hình kiến trúc **Message Broker / Task Queue**:
1. **Tiếp nhận & Trả về ngay lập tức**: Khi người dùng upload video, API lưu file và tạo một Background Task, sau đó lập tức trả về một `task_id` (ví dụ: `{"status": "processing", "task_id": "12345"}`).
2. **Worker xử lý ngầm**: Các thư viện như **Celery** + **Redis** (hoặc RabbitMQ) sẽ nhận `task_id` này và âm thầm chạy toàn bộ Pipeline ở mục 2 và 3 trong background.
3. **Cập nhật Frontend**:
   - **Cách 1 (Polling)**: Frontend định kỳ (mỗi 2-3s) gọi một API `GET /task/{task_id}` để kiểm tra xem quá trình đã xong chưa.
   - **Cách 2 (WebSockets)**: Backend chủ động gửi tín hiệu "Đã hoàn thành" kèm JSON kết quả về Frontend.

---

## Tóm tắt các Thư viện Backend (Python) Đề xuất

- **Web Framework**: `FastAPI` (rất tốt cho xử lý file lớn và hỗ trợ async/await chuẩn) hoặc `Flask` / `Django`.
- **Media Processing**: `opencv-python` (cắt frame), `ffmpeg-python` (xử lý luồng media cơ bản), `librosa` (xử lý tín hiệu âm thanh chuyên sâu).
- **Face Detection**: `facenet-pytorch`, `mtcnn` hoặc `dlib`.
- **AI Model**: `torch` (PyTorch) hoặc `tensorflow` để load mô hình đã train.
- **Task Queue**: `celery` làm worker, `redis` làm broker.
