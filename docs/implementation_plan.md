# Kế hoạch Triển khai Backend & AI - Hệ thống AntiFakeNews Đa phương thức

Tài liệu này phân tích chi tiết kiến trúc Backend, luồng xử lý logic, cách thức xây dựng/huấn luyện mô hình Trí tuệ Nhân tạo (AI) và danh sách các công việc (tasks) cần thực hiện để phát triển dự án "Multimodal Fake News Detection" (Phát hiện tin giả đa phương thức).

## 1. Tổng quan Kiến trúc Hệ thống (System Architecture)

Hệ thống yêu cầu xử lý đồng thời văn bản (Text) và hình ảnh (Image), do đó Backend cần được xây dựng bằng Python để tận dụng tối đa hệ sinh thái AI/Deep Learning (PyTorch/TensorFlow).

- **Framework Backend**: `FastAPI` (Đề xuất do hiệu năng cao, hỗ trợ Async, dễ dàng xây dựng API) hoặc `Flask`.
- **AI Framework**: `PyTorch` hoặc `TensorFlow/Keras` (PyTorch được ưu tiên vì tính linh hoạt trong các mô hình Multimodal).
- **Database**: 
  - `PostgreSQL` hoặc `Supabase`: Lưu trữ lịch sử kiểm tra, thông tin người dùng.
  - `Redis` (Tùy chọn): Cache kết quả kiểm tra để tăng tốc độ phản hồi nếu bài báo đã được kiểm duyệt trước đó.

## 2. Phân tích Mô hình AI Đa phương thức (Multimodal AI Model)

Để nhận diện tin giả đa phương thức, mô hình không chỉ phân tích Text và Image riêng lẻ, mà còn phải đánh giá sự **tương quan** (mâu thuẫn) giữa nội dung văn bản và hình ảnh minh họa.

### A. Kiến trúc Mô hình (Model Architecture)
1. **Text Branch (Nhánh xử lý Văn bản)**:
   - Sử dụng các mô hình Transformer đã được pre-train cho tiếng Việt: `PhoBERT` (của VinAI) hoặc `xlm-roberta-base`.
   - Chức năng: Trích xuất đặc trưng (Text Embeddings) từ tiêu đề và nội dung bài báo, phân tích ngữ nghĩa, giọng điệu giật tít (clickbait), cảm xúc cực đoan.
2. **Image Branch (Nhánh xử lý Hình ảnh)**:
   - Sử dụng các mô hình CNN hoặc Vision Transformer: `ResNet-50`, `EfficientNet`, hoặc `ViT` (Vision Transformer).
   - Chức năng: Trích xuất đặc trưng ảnh (Image Embeddings), phát hiện dấu hiệu ảnh bị chỉnh sửa (manipulation, deepfake), hoặc bối cảnh ảnh.
3. **Fusion Mechanism (Cơ chế Kết hợp)**:
   - Sử dụng `Cross-Attention` hoặc đơn giản là Concatenation (nối vector) kết hợp Multi-Layer Perceptron (MLP) để kết hợp Text Embeddings và Image Embeddings.
   - Chức năng: Tìm ra sự bất đồng nhất. Ví dụ: Chữ nói về "Bão lũ ở miền Trung" nhưng ảnh lại là "Sóng thần ở Nhật Bản".

### B. Yêu cầu về Dữ liệu (Dataset)
Vì tin giả có đặc thù theo ngôn ngữ và văn hóa, việc thu thập dataset tiếng Việt là rất quan trọng:
1. **Dữ liệu tiếng Việt**: 
   - `ViFake` (Tập dữ liệu tin giả tiếng Việt trên mạng xã hội).
   - Dữ liệu tự thu thập (Crawl) từ các trang báo chính thống (Tuổi Trẻ, VNExpress) làm tin thật, và các trang/nhóm Facebook đăng tin rác làm tin giả.
2. **Dữ liệu Đa phương thức tiếng Anh (Để transfer learning nếu cần)**:
   - `Fakeddit`: Tập dữ liệu tin giả khổng lồ từ Reddit có cả text và hình ảnh.
   - `NewsCLIPpings`: Tập dữ liệu chuyên về sự mâu thuẫn giữa Text và Image.

### C. Quy trình Huấn luyện (Training Flow)
- **Tiền xử lý (Preprocessing)**: Làm sạch chữ (xóa emoji, stop words, chuẩn hóa Unicode tiếng Việt). Resize và chuẩn hóa màu sắc cho ảnh.
- **Huấn luyện**: Fine-tune PhoBERT và ResNet trên tập dữ liệu đã gán nhãn (Real/Fake). Tối ưu hóa hàm loss (Binary Cross Entropy).

## 3. Logic Backend (API & Xử lý)

Backend sẽ đóng vai trò cầu nối giữa Frontend và Mô hình AI.

### Các Endpoint API chính:
1. `POST /api/detect`: Nhận file ảnh và đoạn text từ Frontend.
   - **Logic 1**: Kiểm tra tính hợp lệ của dữ liệu đầu vào (Text có trống không? Ảnh có vượt quá 10MB không?).
   - **Logic 2**: Chạy pipeline tiền xử lý (Text Tokenization, Image Normalization).
   - **Logic 3**: Đưa dữ liệu qua AI Model để lấy kết quả (Inference).
   - **Logic 4**: Trả về Response: Nhãn (`REAL` hoặc `FAKE`), độ tin cậy (`Confidence Score`), và các tham số phân tích phụ (ví dụ: điểm bất thường của ảnh).
2. `GET /api/history`: Lấy lịch sử các lần kiểm tra của người dùng (từ DB).
3. `POST /api/feedback`: Cho phép người dùng báo cáo nếu AI nhận diện sai (giúp thu thập data huấn luyện lại).

## 4. Danh sách Công việc (Tasks To-Do)

Dưới đây là danh sách các task cần triển khai cho toàn bộ hệ thống phía sau:

### Giai đoạn 1: Chuẩn bị & Huấn luyện Model AI
- `[ ]` Tìm kiếm, thu thập và làm sạch Dataset (Text + Image) có gán nhãn Real/Fake.
- `[ ]` Xây dựng Text Branch (Fine-tune PhoBERT).
- `[ ]` Xây dựng Image Branch (ResNet/EfficientNet).
- `[ ]` Thiết kế mạng Fusion để kết hợp đặc trưng Text + Image.
- `[ ]` Train mô hình, đánh giá (Accuracy, F1-score) và lưu trọng số model (`.pt` hoặc `.h5`).

### Giai đoạn 2: Xây dựng Backend API
- `[ ]` Khởi tạo project FastAPI/Flask.
- `[ ]` Cấu hình thư mục lưu trữ tạm thời cho file upload (Images).
- `[ ]` Tích hợp model AI đã train vào Backend (Viết class `Predictor` load model vào RAM).
- `[ ]` Viết API endpoint `/api/detect` xử lý Multipart/form-data.
- `[ ]` Thêm CORS để Frontend (React/Vite) có thể gọi API.

### Giai đoạn 3: Database & Mở rộng (Tùy chọn)
- `[ ]` Thiết kế schema Database (Bảng `Users`, bảng `DetectionHistory`).
- `[ ]` Viết API lưu và truy xuất lịch sử kiểm tra.
- `[ ]` Deploy Backend lên server có GPU (AWS EC2, Google Cloud, hoặc RunPod) hoặc tối ưu hóa chạy CPU.

> [!IMPORTANT]
> **User Review Required**: Kế hoạch trên đã phân định rõ các yêu cầu về Dữ liệu (Khó khăn nhất), Kiến trúc AI và Backend API. Bạn hãy xem qua các task này và xác nhận xem chúng ta sẽ ưu tiên bắt đầu từ việc **Xây dựng Backend API giả lập (Mock API)** trước để nối với Frontend, hay là bắt tay vào **Tìm kiếm và xây dựng AI Model** ngay bây giờ?
