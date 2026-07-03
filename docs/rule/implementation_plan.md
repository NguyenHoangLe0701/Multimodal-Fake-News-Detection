# Đề xuất: Hệ thống Tự động Kiểm định Chất lượng Dữ liệu (Data Auditing)

Bạn đã đưa ra một ví dụ cực kỳ kinh điển và sắc sảo về lỗi **"Garbage In, Garbage Out" (GIGO)** trong Machine Learning. Một hệ thống AI báo cáo độ chính xác (Accuracy) lên đến 88% hay 95% hoàn toàn vô nghĩa nếu bản thân **Dataset gốc đã bị dán nhãn sai** hoặc **chứa các đặc trưng rác (như tên miền lưu trữ ảnh thay vì tên miền báo chí)**.

Hiện tại trong thư mục mã nguồn (`datasets/processed/train.csv`), dữ liệu chỉ có khoảng 90KB (dữ liệu mẫu rất nhỏ), do đó tôi không thể "bắt quả tang" ngay dòng code nào đang gây ra lỗi 80.000+ bài từ `reddit` như trong ảnh của bạn. Tuy nhiên, để giải quyết tận gốc vấn đề này cho toàn bộ dự án thực tế, tôi đề xuất chúng ta **xây dựng một "Bộ lọc và Quét dữ liệu tự động" (Data Validation Pipeline) chạy NGAY TRƯỚC BƯỚC TRAIN**.

Dưới đây là kế hoạch triển khai bộ công cụ này:

---

## 1. Mục tiêu (Giải quyết chính xác các lỗi bạn vừa nêu)

Bộ công cụ sẽ tự động chạy và xuất report cảnh báo nếu phát hiện:
- **Lỗi mâu thuẫn số liệu (Data Logic Bug):** Đảm bảo tổng số bài báo không bị "đẻ nhánh" khi join (kết nối) các bảng dữ liệu với nhau.
- **Rò rỉ nhãn / Gán nhãn ngược (Label Leakage):** Báo động đỏ ngay nếu các tên miền (Domain) thuộc danh sách *Whitelist* (Ví dụ: `reuters.com`, `bbc.com`) bị gán nhãn là Tin giả (Label 0).
- **Phân tích bản chất Domain (Domain Sanity Check):** Loại bỏ hoặc cảnh báo các tên miền rác chuyên dùng để lưu trữ ảnh/video thay vì báo chí (`i.redd.it`, `imgur.com`, `youtube.com`).

## 2. Kế hoạch triển khai kỹ thuật

### Bước 1: Tạo thư mục Data Auditing
Tạo một thư mục mới: `datasets/auditor/` chứa các script phân tích.

### Bước 2: Tích hợp `ydata-profiling` (Thay thế cho Pandas Profiling)
- Cài đặt thư viện `ydata-profiling`.
- Viết script `generate_data_report.py`. Chức năng của script này là đọc file dataset chuẩn bị train, tự động quét toàn bộ phân phối dữ liệu (Distribution), đếm số lượng (Cardinality), và xuất ra một file HTML đẹp mắt (tương tự như biểu đồ bạn gửi nhưng toàn diện hơn 100 lần).
- Bạn chỉ cần mở file HTML này là thấy ngay dữ liệu có đang bị lệch (Imbalanced) hay có domain rác nào chiếm tới 80.000 dòng hay không.

### Bước 3: Viết Rule Checker (Bộ quy tắc cứng) bằng Python
Viết một file `data_validator.py` chạy các luật (Rules) kiểm tra cứng trước khi cho phép mô hình train:
1. **Rule 1 (Trust Source Check):** Quét cột `url`/`domain`. Nếu `label == FAKE` mà `domain` nằm trong mảng `['reuters.com', 'bbc.com', 'cnn.com', 'theguardian.com']` -> Cảnh báo lỗi gán nhãn sai và IN RA LOG các dòng đó.
2. **Rule 2 (Image Hosting Check):** Nếu cột `domain` kết thúc bằng `redd.it`, `imgur.com`, `twimg.com` -> Đánh dấu là "Nguồn không đáng tin cậy/Nguồn lưu trữ" và yêu cầu User xem xét có nên drop (xóa) khỏi tập train hay không.
3. **Rule 3 (Balance Check):** Nếu tỷ lệ Tin thật / Tin giả lệch nhau quá 30% -> Cảnh báo dữ liệu bị Imbalanced.

### Bước 4: Tích hợp vào Workflow Github Actions
- Sửa lại file `.github/workflows/ci-cd.yml`: Thêm một bước tên là `Data Sanity Check` chạy `data_validator.py`.
- Nếu data validator báo lỗi gán nhãn sai (như vụ Reuters bị coi là Fake news), CI/CD pipeline sẽ bị **tạch (Fails) ngay lập tức** và không cho phép mang dataset này đi Train.

---

## 3. User Review Required & Open Questions

> [!IMPORTANT]
> Phương pháp trên sẽ giúp hệ thống tự động hóa việc phát hiện các mâu thuẫn như trong bức ảnh bạn gửi, đảm bảo độ chính xác 88% của mô hình là "Hàng thật giá thật".

Để tôi tiến hành code bộ Auditing này, bạn vui lòng cho ý kiến:

1. **Danh sách Whitelist:** Bạn có muốn tôi định nghĩa sẵn một danh sách các báo chí chính thống uy tín (như bbc, cnn, reuters...) để làm "Kim chỉ nam" kiểm tra gán nhãn sai không? Nếu có, xin hãy gợi ý thêm một vài trang web báo chí uy tín của Việt Nam (nếu dataset có chứa tin tiếng Việt).
2. **File Dataset thực tế:** Hiện tại `train.csv` đang rất nhỏ gọn. Các cột dữ liệu thực tế mà bạn thu thập được (trước khi đưa vào model) bao gồm những cột nào? Có phải là: `[text, image_filename, label, url/domain]` không? Tôi cần biết để viết rule cho chính xác.

Xin hãy phản hồi để tôi bắt tay vào code ngay `data_validator.py`!
