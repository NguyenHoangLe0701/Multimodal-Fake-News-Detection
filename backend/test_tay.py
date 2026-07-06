from PIL import Image
from app.services.ai_service import verify_fake_news, _load_model

print("1. Đang nạp mô hình vào RAM...")
_load_model()

# 2. Đưa một bức ảnh thuần túy (KHÔNG CHỮ) để thỏa mãn ResNet
try:
    img = Image.open("Obama.jpg").convert("RGB")
except Exception as e:
    print("Vui lòng để một tấm ảnh test_real.jpg vào thư mục hiện tại nhé!")
    exit()

# 3. Truyền tay một đoạn text báo chí chuẩn mực để thỏa mãn BERT (Bỏ qua OCR)
text_chuan = "Former US President Barack Obama delivered a speech on climate change today in Washington, emphasizing the need for green energy."

print("2. Đang phân tích...")
result = verify_fake_news(img, text_chuan)

print("\n=== KẾT QUẢ ===")
print(f"Nhãn: {result['label']}")
print(f"Độ tự tin: {result['confidence']}")