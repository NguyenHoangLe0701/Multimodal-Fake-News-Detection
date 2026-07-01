# Lộ trình Hoàn thiện Dự án "AntiFakeNews" (Roadmap to Production)

Để biến dự án này từ một "mô hình Lab" thành một sản phẩm thực tế, hoàn chỉnh và có khả năng phát hiện tin giả cực kỳ chính xác (Production-ready), đây là lộ trình chi tiết từng bước mà một kỹ sư AI (AI Engineer) cần thực hiện.

---

## Bước 1: Xây dựng & Làm giàu Dữ liệu (Data Enrichment)

Dữ liệu là "xăng", mô hình AI là "động cơ". Động cơ dù xịn đến mấy (PhoBERT) nhưng xăng bẩn thì xe cũng không chạy được.

**1. Khai thác Dataset có sẵn (Dataset Cơ sở):**
- **ViFake Dataset**: Đây là bộ dữ liệu chuẩn nhất hiện nay cho tiếng Việt. Bạn lên Github/Kaggle tìm kiếm và tải về. Nó chứa các bài đăng mạng xã hội đã được gán nhãn sẵn.
- **Fakeddit Dataset**: (Tùy chọn) Đây là bộ dữ liệu tiếng Anh nhưng rất mạnh về nhận diện ảnh chế/ảnh ghép. Bạn có thể dùng nó để train riêng cho nhánh hình ảnh `ResNet50` trước.

**2. Thu thập dữ liệu Thực tế (Data Crawling):**
- **Tin thật (REAL)**: Chạy lại script `vnexpress_crawler.py` mỗi ngày để cào 1,000 bài báo từ VNExpress, Dân Trí.
- **Tin giả (FAKE)**: Viết thêm 1 script cào dữ liệu từ các Group Facebook, diễn đàn hoặc sử dụng các cảnh báo từ "Trung tâm Xử lý tin giả Việt Nam (VAFC)".

**3. Tiền xử lý (Data Cleaning):**
- Dùng thư viện `Underthesea` hoặc `PyVi` để tách từ (Word Segmentation) tiếng Việt.
- Chuyển toàn bộ về chữ thường, xóa URL, xóa biểu tượng cảm xúc (Emoji) để tránh làm nhiễu mô hình.
- Phân chia tập dữ liệu: `Train (80%)`, `Validation (10%)`, `Test (10%)`.

---

## Bước 2: Huấn luyện Mô hình (Model Training)

Việc chạy `train.py` trên máy tính cá nhân sẽ **mất hàng tuần** hoặc làm treo máy vì RAM/GPU không đủ. Bạn phải chuyển môi trường huấn luyện lên đám mây (Cloud).

**1. Chuẩn bị Môi trường Máy chủ (Cloud GPU):**
- Đưa toàn bộ thư mục `training/` và tập `train.csv`, `val.csv` lên **Google Colab** hoặc **Kaggle Kernel** (Miễn phí GPU Tesla T4/P100).
- Chạy lệnh `!pip install transformers torch pandas pillow` trên Colab.

**2. Tối ưu Siêu tham số (Hyperparameter Tuning):**
- **Batch Size:** 16 hoặc 32 (Tùy thuộc dung lượng VRAM của Colab).
- **Learning Rate:** Đặt ở mức rất nhỏ (VD: `2e-5`) để không làm hỏng trọng số (weights) khổng lồ mà PhoBERT đã học trước đó.
- **Freezing Layers:** Ở 5 Epoch đầu tiên, bạn nên "đóng băng" (Freeze) toàn bộ trọng số của PhoBERT và ResNet50. Chỉ cho phép mạng học (train) ở phần Hợp nhất (Fusion Classifier). Đến Epoch thứ 6 mới rã đông (Unfreeze) toàn bộ để "Fine-tune" tinh chỉnh nhè nhẹ. Điều này chống Overfitting cực hiệu quả!

**3. Đánh giá Mô hình:**
- Không chỉ nhìn vào Accuracy, hãy chú ý đến **F1-Score**. F1-Score cao mới đảm bảo AI không đánh đồng (cứ đoán đại REAL hết).

---

## Bước 3: Đóng gói & Triển khai (Deployment)

Khi mô hình đã đạt F1-Score mong đợi (thường trên 85% cho tiếng Việt), bạn sẽ lưu nó ra một file `best_model.pth`.

**1. Tích hợp lại vào Backend:**
- Chép file `best_model.pth` vào thư mục `backend/model_weights/` của máy tính.
- Mở file `backend/app/services/ai_service.py` ra. Bỏ toàn bộ phần code MOCK đang giả lập hiện tại. Xóa dấu `#` để kích hoạt đoạn code `REAL Implementation` đã được viết sẵn bên dưới.

**2. Đẩy hệ thống lên Internet (Hosting):**
- **Cơ sở dữ liệu:** Cấu hình tài khoản Supabase thật, lấy API Key dán vào `.env`.
- **Backend (Flask API):** Deploy miễn phí lên **Render** hoặc **Railway**. Nó sẽ tạo ra một đường link API (Ví dụ: `api.antifakenews.onrender.com`).
- **Frontend (React/Vite):** Sửa đường dẫn API trong React trỏ về Backend Render. Sau đó đẩy code Frontend lên **Vercel** (Hoàn toàn miễn phí, siêu nhanh).

---

## Bước 4: Vận hành Thực tế (MLOps & Monitoring)

Dự án AI không bao giờ kết thúc ở lúc Train xong. Kẻ xấu tạo ra tin giả ngày một tinh vi hơn (đặc biệt là Deepfake).

**1. Thu thập Feedback của người dùng:**
- Tại giao diện Frontend, bạn có thể thiết kế thêm nút: *"Báo cáo kết quả sai"*.
- Nếu AI đoán FAKE nhưng người dùng xác nhận là REAL, Backend sẽ lưu lại dữ liệu này vào một bảng `false_predictions` trên Supabase.

**2. Huấn luyện lại (Retraining):**
- Cuối mỗi tháng, bạn lấy toàn bộ dữ liệu ở bảng `false_predictions` và dữ liệu cào mới trên báo chí, trộn vào tập Train cũ.
- Đưa lên Google Colab để Train thêm (Continue Training). AI của bạn sẽ ngày càng "khôn" và bắt kịp các trend tin giả lừa đảo mới nhất.

> [!NOTE]
> Khi đi xin việc hoặc làm Đồ án tốt nghiệp, chỉ cần bạn trình bày được Lộ trình này và đã có sẵn khung Source Code hiện tại để chứng minh, bạn chắc chắn sẽ ghi được số điểm tuyệt đối trong mắt hội đồng/nhà tuyển dụng!
