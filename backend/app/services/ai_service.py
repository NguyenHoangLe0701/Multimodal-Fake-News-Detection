import cv2
import numpy as np
import pytesseract
import re
import torch
import torch.nn.functional as F
from PIL import Image
from transformers import BertTokenizer
from torchvision import transforms
from config import Config
from .models import DualStreamFakeNewsModel, TextOnlyFakeNewsModel
from .translation_service import translate_to_english, translate_reason_to_vietnamese

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

_model = None
_text_model = None
_text_model_available = False
_tokenizer = None
_transform = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def _load_model():
    """Load both Multimodal and Text-Only models"""
    global _model, _text_model, _text_model_available, _tokenizer, _transform, device
    
    if _model is None:
        _model = DualStreamFakeNewsModel().to(device)
        try:
            _model.load_state_dict(torch.load(Config.MODEL_PATH, map_location=device, weights_only=True))
        except FileNotFoundError:
            print(f"[Warning] Khong the tim thay file weights {Config.MODEL_PATH}. Dang chay model ngau nhien de debug!")
        _model.eval()
        
        _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')  # nosec B615
        _transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    if _text_model is None:
        _text_model = TextOnlyFakeNewsModel().to(device)
        try:
            _text_model.load_state_dict(torch.load(Config.TEXT_MODEL_PATH, map_location=device, weights_only=True))
            _text_model_available = True
            print(f"[Info] Text model loaded from {Config.TEXT_MODEL_PATH}")
        except FileNotFoundError:
            _text_model_available = False
            print(f"[Warning] Text model chua san sang tai {Config.TEXT_MODEL_PATH}. Tinh nang text-only dang phat trien.")
        _text_model.eval()

def clean_extracted_text(raw_text: str) -> str:
    text = str(raw_text).lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'\[.*?\]|\(.*?\)', '', text)
    # Giong ban cu nhung KHONG xoa tieng Viet, giu lai chu va so, loai bo ky tu dac biet
    text = re.sub(r'[^\w\s]', '', text) 
    clean_text = " ".join(text.split())
    return clean_text if clean_text else "no text context"

def separate_pixels_and_text(pil_image: Image.Image):
    """Thuật toán: Nhận 1 ảnh gốc -> Trả về (Ảnh đã tẩy chữ, Text đã cạo)"""
    try:
        extracted_text = pytesseract.image_to_string(pil_image).strip()
        
        cv_img = np.array(pil_image)
        cv_img = cv2.cvtColor(cv_img, cv2.COLOR_RGB2BGR)
        h, w, _ = cv_img.shape
        mask = np.zeros((h, w), dtype=np.uint8)
        boxes = pytesseract.image_to_boxes(pil_image)
        
        for b in boxes.splitlines():
            b = b.split(' ')
            if len(b) >= 5:
                x1, y1, x2, y2 = int(b[1]), int(b[2]), int(b[3]), int(b[4])
                cv2.rectangle(mask, (x1, h - y1), (x2, h - y2), (255), thickness=-1)

        clean_cv_img = cv2.inpaint(cv_img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
        clean_cv_img = cv2.cvtColor(clean_cv_img, cv2.COLOR_BGR2RGB)
        
        return Image.fromarray(clean_cv_img), clean_extracted_text(extracted_text)
    except Exception as e:
        print(f"[OCR Warning] Tesseract khong kha dung, bo qua OCR: {e}")
        return pil_image, "no text context"

def verify_text_only(pure_text: str):
    """Xy ly text-only bang TextOnlyFakeNewsModel"""
    global _text_model, _tokenizer, device
    
    inputs = _tokenizer(
        pure_text, add_special_tokens=True, max_length=256,
        padding='max_length', truncation=True, return_tensors='pt'
    ).to(device)

    with torch.no_grad():
        logits = _text_model(inputs['input_ids'], inputs['attention_mask'])
        probabilities = F.softmax(logits, dim=1)
        prob_real = probabilities[0][0].item()
        prob_fake = probabilities[0][1].item()
        predicted_class = torch.argmax(logits, dim=1).item()

    label = "REAL" if predicted_class == 0 else "FAKE"
    confidence = prob_real if predicted_class == 0 else prob_fake
    reason = "Van ban nhat quan, khong co dau hieu sai lech." if label == "REAL" else "Phat hien su bat thuong hoac tin gia trong noi dung."

    return {
        "label": label,
        "confidence": confidence,
        "prob_fake": prob_fake,
        "reason": reason
    }

def verify_multimodal(pure_image: Image.Image, pure_text: str):
    """Xu ly image-only hoac multimodal bang DualStreamFakeNewsModel"""
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
    reason = "Van ban va hinh anh nhat quan, khong phat hien dau hieu cat ghep." if label == "REAL" else "Phat hien su bat thuong trong ngu canh van ban hoac dau hieu chinh sua hinh anh."

    return {
        "label": label,
        "confidence": confidence,
        "prob_fake": prob_fake,
        "reason": reason
    }

def analyze(mode: str, provided_text: str, pil_image: Image.Image = None):
    """
    Tong dieu phoi:
    mode='text' -> Text-Only model
    mode='image' -> Multimodal model (voi dummy text hoac text tu OCR)
    mode='multimodal' -> Ket hop 2 model
    """
    global _text_model_available
    
    # 1. Prepare text and translate
    original_text = provided_text.strip()
    translated_text = translate_to_english(original_text) if original_text else ""
    
    if mode == "text":
        if not _text_model_available:
            return {"error": "Text model is not available", "text_model_available": False}
        
        result = verify_text_only(translated_text or "no text context")
        return {
            "label": result["label"],
            "confidence": round(result["confidence"], 4),
            "text_score": round(result["prob_fake"], 4),
            "image_score": "N/A",
            "reason": translate_reason_to_vietnamese(result["reason"]),
            "extracted_text": "",
            "original_text": original_text,
            "translated_text": translated_text,
            "text_model_available": True
        }
        
    elif mode == "image":
        # OCR bóc chữ
        clean_image, extracted_text = separate_pixels_and_text(pil_image)
        # Dich text bóc duoc neu can
        final_text = translate_to_english(extracted_text)
        
        result = verify_multimodal(clean_image, final_text)
        return {
            "label": result["label"],
            "confidence": round(result["confidence"], 4),
            "text_score": "N/A",
            "image_score": round(result["prob_fake"], 4),
            "reason": translate_reason_to_vietnamese(result["reason"]),
            "extracted_text": extracted_text, # hien thi Tieng Viet/goc
            "original_text": "",
            "translated_text": "",
            "text_model_available": _text_model_available
        }
        
    elif mode == "multimodal":
        # Ket hop text nguoi dung va anh
        clean_image, extracted_text = separate_pixels_and_text(pil_image)
        # Uu tien text nguoi dung nhap, neu khong co dung text OCR
        final_text = translated_text if translated_text else translate_to_english(extracted_text)
        
        img_result = verify_multimodal(clean_image, final_text)
        
        if _text_model_available and original_text:
            text_result = verify_text_only(translated_text)
            
            # Trung binh cong prob_fake cua 2 model
            combined_prob_fake = (img_result["prob_fake"] + text_result["prob_fake"]) / 2
            
            if combined_prob_fake > 0.5:
                label = "FAKE"
                confidence = combined_prob_fake
                reason = "Phat hien su bat thuong khi ket hop ca van ban va hinh anh."
            else:
                label = "REAL"
                confidence = 1 - combined_prob_fake
                reason = "Noi dung tin cay sau khi kiem chung cheo van ban va hinh anh."
                
            return {
                "label": label,
                "confidence": round(confidence, 4),
                "text_score": round(text_result["prob_fake"], 4),
                "image_score": round(img_result["prob_fake"], 4),
                "reason": translate_reason_to_vietnamese(reason),
                "extracted_text": extracted_text,
                "original_text": original_text,
                "translated_text": translated_text,
                "text_model_available": True
            }
        else:
            # Fallback ve multimodal binh thuong neu khong co text_model hoac khong co text
            return {
                "label": img_result["label"],
                "confidence": round(img_result["confidence"], 4),
                "text_score": "N/A",
                "image_score": round(img_result["prob_fake"], 4),
                "reason": translate_reason_to_vietnamese(img_result["reason"]),
                "extracted_text": extracted_text,
                "original_text": original_text,
                "translated_text": translated_text,
                "text_model_available": _text_model_available
            }