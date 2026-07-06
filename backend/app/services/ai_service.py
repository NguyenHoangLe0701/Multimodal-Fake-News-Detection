import pytesseract
import re
import torch
import torch.nn.functional as F
from PIL import Image
from transformers import BertTokenizer
from torchvision import transforms
from config import Config
from .models import DualStreamFakeNewsModel

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

_model = None
_tokenizer = None
_transform = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def _load_model():
    global _model, _tokenizer, _transform
    if _model is None:
        _model = DualStreamFakeNewsModel().to(device)
        _model.load_state_dict(torch.load(Config.MODEL_PATH, map_location=device, weights_only=True))
        _model.eval()
        _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')  # nosec B615
        _transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

def clean_extracted_text(raw_text: str) -> str:
    text = str(raw_text).lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'\[.*?\]|\(.*?\)', '', text)
    # CẬP NHẬT: Giữ lại dấu chấm, phẩy, hỏi chấm, ngoặc kép, gạch ngang để chuẩn văn phong
    text = re.sub(r'[^a-zA-Z0-9\s.,!?\'"-]', '', text)
    clean_text = " ".join(text.split())
    return clean_text if clean_text else ""

def verify_fake_news(pure_image: Image.Image, pure_text: str):
    """Nhận dữ liệu để đưa vào Dual-Stream Model"""
    global _model, _tokenizer, _transform, device
    
    inputs = _tokenizer(
        pure_text, add_special_tokens=True, max_length=256,
        padding='max_length', truncation=True, return_tensors='pt'
    ).to(device)

    img_tensor = _transform(pure_image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = _model(inputs['input_ids'], inputs['attention_mask'], img_tensor)
        probabilities = F.softmax(logits, dim=1)
        
        prob_real = probabilities[0][0].item()
        prob_fake = probabilities[0][1].item()
        predicted_class = torch.argmax(logits, dim=1).item()

    label = "REAL" if predicted_class == 0 else "FAKE"
    confidence = prob_real if predicted_class == 0 else prob_fake
    reason = "Văn bản và hình ảnh nhất quán, không phát hiện dấu hiệu cắt ghép." if label == "REAL" else "Phát hiện sự bất thường trong ngữ cảnh văn bản hoặc dấu hiệu chỉnh sửa hình ảnh."

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "text_score": round(prob_fake, 4),
        "image_score": round(prob_fake, 4),
        "reason": reason,
        "extracted_text": pure_text
    }

def analyze_image_pipeline(pil_image: Image.Image):
    """
    TỔNG ĐIỀU PHỐI MỚI:
    1. Bóc chữ bằng OCR (Tesseract).
    2. Giữ nguyên ảnh gốc đưa vào cho ResNet (bỏ qua Inpaint làm nhòe ảnh).
    """
    # Bước 1: Bóc chữ từ ảnh gốc
    raw_text = pytesseract.image_to_string(pil_image).strip()
    clean_text = clean_extracted_text(raw_text)
    
    # Bước 2: Truyền thẳng Ảnh gốc + Text đã làm sạch vào Mô hình
    return verify_fake_news(pil_image, clean_text)