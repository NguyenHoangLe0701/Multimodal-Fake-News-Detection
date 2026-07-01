# Chiến lược Xây dựng Dataset cho Đồ án (AntiFakeNews)

Khi làm đồ án AI về nhận diện Tin giả (Fake News), dữ liệu chính là phần giảng viên thường xuyên "xoáy" vào nhiều nhất. Việc bạn tìm được một bộ dữ liệu từ năm `2016 - 2020` là một khởi đầu rất phổ biến. Tài liệu này sẽ phân tích chi tiết tại sao bạn nên dùng nó, điểm yếu của nó là gì, và cách khắc phục để đạt điểm tối đa.

---

## 1. Vấn đề của Dataset cũ (2016 - 2020)

### Điểm yếu: Lỗi thời về "Bối cảnh" (Context)
Tin giả thay đổi theo từng năm. Ở giai đoạn 2016-2020, tin giả chủ yếu xoay quanh các chủ đề như chính trị cũ, hoặc tin bão lụt thô sơ. Nó hoàn toàn **KHÔNG CÓ** các từ khóa thời sự hiện nay như:
- Lừa đảo đầu tư Crypto, Blockchain.
- Trí tuệ nhân tạo (Deepfake, ghép giọng nói).
- Các trend lừa đảo việc làm online (nhấn like Tiktok kiếm tiền).

### Điểm mạnh: Vẫn giữ nguyên "Cấu trúc lừa đảo" (Syntax & Semantics)
Dù nội dung thay đổi, nhưng **cách hành văn của tin giả 10 năm nay không hề đổi**:
- Thích sử dụng câu cảm thán, viết hoa toàn bộ: *"SỐC!!!", "KHẨN CẤP!!!", "BÍ MẬT ĐỘNG TRỜI!!!"*.
- Sai chính tả có chủ đích hoặc dùng biểu tượng cảm xúc vô tội vạ.
- Cấu trúc câu kích động sự sợ hãi hoặc tò mò.

> [!TIP]
> **Kết luận:** Bộ data 2016-2020 **CỰC KỲ CÓ GIÁ TRỊ** để dạy cho AI (PhoBERT) nhận biết được "Giọng điệu" của tin giả. Đừng bỏ nó đi!

---

## 2. Giải pháp "Hybrid" (Kết hợp) - Cách ăn trọn điểm Đồ án

Để bù đắp lỗ hổng bối cảnh của bộ Data cũ, bạn áp dụng phương pháp **Hybrid Dataset** (Bộ dữ liệu lai). Đây là lúc đoạn code Crawler (cào dữ liệu) của chúng ta phát huy sức mạnh tối đa.

**Công thức trộn Data hoàn hảo (Gợi ý):**
- **80% (Dữ liệu nền tảng):** Lấy từ bộ Data 2016-2020. Mục đích: Dạy AI cấu trúc ngữ pháp và từ vựng lừa đảo cơ bản.
- **20% (Dữ liệu Fine-tune):** Lấy từ Crawler cào tự động các bài báo, bài đăng Facebook/Tiktok từ năm `2023 - hiện tại`. Mục đích: Cập nhật "từ khóa mới" (Deepfake, Crypto, v.v) cho AI.

> [!IMPORTANT]
> **Cách trình bày trước Hội đồng:** 
> *"Thưa Hội đồng, nhược điểm lớn nhất của các đồ án Fake News hiện nay là AI bị lỗi thời nhanh chóng do chỉ dùng Data cũ. Vì vậy, em đã xây dựng một luồng kiến trúc Hybrid. Em dùng Data học thuật 2016-2020 làm Base Knowledge, và tự viết một con Bot cào dữ liệu tự động để AI liên tục cập nhật các thủ đoạn lừa đảo mới nhất trong năm nay!"* -> **Nghe cực kỳ kỹ sư và thực tiễn!**

---

## 3. Các Nguồn Dataset Tham Khảo Chất Lượng (Tiếng Việt)

Nếu bạn cần tìm kiếm thêm các bộ dataset chất lượng cho Tiếng Việt, đây là 3 nguồn uy tín nhất để đưa vào báo cáo đồ án:

### Nguồn Dữ liệu Học thuật (Academic Datasets)
1. **ViFake (Trên Kaggle / Github):**
   - Rất nổi tiếng, chuyên về tin đồn trên mạng xã hội Việt Nam.
2. **UIT-ViSFD (Đại học CNTT ĐHQG-HCM):**
   - Bộ dữ liệu do chính trường ĐH CNTT TP.HCM nghiên cứu và công bố (Vietnamese Social Media Fake News Dataset). Đưa tên bộ này vào báo cáo sẽ mang tính học thuật cực cao.
3. **ReINTEL (Cuộc thi VLSP 2020):**
   - Tập dữ liệu từ cuộc thi phân tích tin giả của cộng đồng Xử lý Ngôn ngữ Tự nhiên Việt Nam.

### Nguồn Tự Động Cào (Crawler Sources)
1. **Cổng thông tin chống tin giả Quốc gia (tingia.gov.vn):**
   - Nơi chính phủ đóng mộc "TIN GIẢ" cho các vụ việc mới nhất.
2. **Chongluadao.vn (Của chuyên gia Hiếu PC):**
   - Chứa vô vàn các cảnh báo lừa đảo trực tuyến mới nhất.

---

## 4. Xử lý Lỗi Kỹ Thuật (Khi Dataset cũ không có hình ảnh)

Khi tải dataset cũ về, bạn sẽ nhận ra một vấn đề: **Tụi nó chỉ có cột Text (chữ), không hề có Hình ảnh!** 
Làm sao để đưa vào mô hình Đa phương thức (Multimodal) của chúng ta?

> [!NOTE]
> **Giải pháp:** Trong file `data_loader.py` tôi viết cho bạn, tính năng này đã được tự động hóa. Nếu một bài báo bị thiếu hình ảnh, hệ thống sẽ tự động tạo ra một **bức ảnh trống (Black Image / Zero Tensor)**: `image = torch.zeros(3, 224, 224)`. 

Lúc này, mạng nơ-ron ResNet50 sẽ nhận diện bức ảnh là vô giá trị, và mô hình (nhờ cơ chế Backpropagation) sẽ **tự động dồn toàn bộ sự chú ý (Attention Weight)** sang nhánh văn bản PhoBERT để ra quyết định. Đây là kỹ thuật chịu lỗi (Fault-Tolerance) siêu việt để biến mô hình Multimodal có thể hoạt động hoàn hảo ngay cả khi bị mất 1 nhánh dữ liệu!
