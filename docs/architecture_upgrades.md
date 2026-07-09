# Tổng hợp Nâng cấp Kiến trúc Hệ thống AI (TruthGuard V2)

Dựa trên những gì chúng ta đã "đập đi xây lại" nãy giờ, hệ thống của bạn đã vượt xa khỏi thiết kế ban đầu. Dưới đây là bản tổng hợp chi tiết các cơ chế mới và phân tích những điểm còn thiếu trong Sơ đồ Kiến trúc mà bạn vừa gửi.

---

## 1. Các Cơ chế mới đã được cập nhật vào Hệ thống

Hệ thống hiện tại không còn là một mô hình học máy đơn thuần, mà đã trở thành một **Hệ thống AI Đa tầng (Multi-Gate AI Pipeline)**.

### 🛡️ Gate 1: Lõi Phân loại Cơ sở (Base Classification)
- **Công nghệ:** ResNet50 (Xử lý ảnh) + BERT (Xử lý văn bản) -> Cắt ghép Vector (Late Fusion).
- **Nhiệm vụ:** Đánh giá văn phong báo chí, phát hiện từ ngữ kích động/lừa đảo, và tìm kiếm các dấu hiệu nhiễu/chỉnh sửa (manipulation) trên bề mặt bức ảnh.
- **Tình trạng:** Đã có từ đầu, nhưng điểm tự tin (Confidence) thường khá khiêm tốn (chỉ khoảng 50-60%).

### 👁️ Gate 2: Cổng kiểm tra Ngữ nghĩa (Semantic Alignment)
- **Công nghệ:** OpenAI CLIP (Vision-Language Model).
- **Nhiệm vụ:** Bắt lỗi "Râu ông nọ cắm cằm bà kia" (Ví dụ: Ảnh Mèo đi với bài báo Giá Xăng).
- **Cơ chế:** Tính điểm Cosine Similarity giữa Ảnh và Chữ. Nếu điểm `< 0.2`, hệ thống lập tức phủ quyết Gate 1, đạp kết quả về **FAKE**.

### 🔍 Gate 3: Cổng Đối chiếu Sự thật qua Ảnh (OCR Cross-Check)
- **Công nghệ:** Tesseract OCR (bổ sung gói Tiếng Việt `vie.traineddata`) + Bộ Dịch thuật (Deep-Translator) + CLIP Text Encoder.
- **Nhiệm vụ:** Bắt lỗi "Treo đầu dê bán thịt chó" tinh vi (Ví dụ: Ảnh Lễ hội Hà Nội đi với bài báo Nhà cổ Tây Ninh).
- **Cơ chế:** 
  - Quét tìm và bóc tách các đoạn chữ ẩn bên trong bức ảnh (băng rôn, biển số xe, văn bản).
  - Tự động dịch sang Tiếng Anh và đối chiếu trực tiếp với nội dung Bài báo.
  - Nếu độ lệch pha quá lớn (Cosine Similarity `< 0.82`), lập tức báo động **FAKE**.

### 🎁 Cơ chế Cộng điểm thưởng (Confidence Reward Mechanism)
- **Nhiệm vụ:** Khắc phục tình trạng "nhát gan" của mô hình cơ sở.
- **Cơ chế:** Nếu bức ảnh và bài báo đi qua chót lọt các Cổng chặn, và CLIP đánh giá chúng khớp nhau hoàn hảo (`cos_sim > 0.25`), hệ thống sẽ **Cộng dồn điểm tự tin** (Có thể đẩy từ 54% lên tới 90-99%).

---

## 2. Phân tích Sơ đồ Hiện tại (Ảnh bạn cung cấp đang thiếu gì?)

Nhìn vào bức ảnh sơ đồ luồng (Flowchart) mà bạn gửi, có thể thấy nó được thiết kế theo tư duy **Fusion truyền thống**. Sơ đồ này hiện tại đã **BỊ LỖI THỜI** và thiếu vắng hoàn toàn những "vũ khí hạng nặng" mà chúng ta vừa trang bị.

Dưới đây là những điểm Sơ đồ của bạn đang thiếu:

> [!WARNING]
> **Thiếu Toàn bộ Khối Xử lý Đa phương thức Chéo (Cross-Modal Logic)**
> Trong khối `3. TECH SOLUTIONS` và `4. AI+LOGIC`, sơ đồ chỉ đề cập đến BERT và ResNet50. Nó hoàn toàn thiếu vắng mảnh ghép quan trọng nhất: **OpenAI CLIP**.

> [!IMPORTANT]
> **Thiếu Khối Bóc tách Chữ từ Ảnh (Image-to-Text)**
> Ở phần `2. PREPROCESSING (Hình ảnh)`, sơ đồ chỉ ghi *Resize* và *Normalization*. Hoàn toàn không có bước chạy **OCR (Tesseract)** để trích xuất văn bản từ hình ảnh làm dữ kiện đối chiếu.

> [!CAUTION]
> **Quy trình Quyết định (Decision Logic) đang bị sai lệch**
> Ở khối `4A. FEATURE FUSION`, sơ đồ chốt hạ kết quả chỉ bằng cách đưa vector 2816 chiều qua lớp `Softmax Layer -> Fake/Real`. 
> 
> Trong thực tế hiện tại, lớp Softmax đó chỉ đóng vai trò là **Gate 1**. Quyết định sống còn của hệ thống giờ đây phụ thuộc rất lớn vào **Gate 2 (Điểm Cosine)** và **Gate 3 (Đối chiếu OCR)**. Sơ đồ cần vẽ thêm các nhánh điều kiện logic (If/Else) của Cổng chặn.

> [!TIP]
> **Thiếu Khối Dịch thuật (Translation Pipeline)**
> Để các AI quốc tế (như CLIP) hoạt động tốt trên tin tức Tiếng Việt, chúng ta đã phải xây dựng một lõi Dịch thuật tự động (`deep-translator`). Khối này cần được bổ sung vào phần Preprocessing của Sơ đồ.

**Kết luận:** Sơ đồ này mô tả rất tốt phiên bản V1 của hệ thống. Nhưng với phiên bản **TruthGuard V2** hiện tại, bạn sẽ cần phải vẽ thêm một nhánh lớn mang tên **Semantic & Fact-Checking Logic** kẹp giữa bước Feature Fusion và bước Output Result!
