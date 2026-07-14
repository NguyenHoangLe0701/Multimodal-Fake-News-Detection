import cv2
import numpy as np
import pytesseract
import re
import torch
import torch.nn.functional as F
from PIL import Image
from transformers import BertTokenizer, CLIPProcessor, CLIPModel
from torchvision import transforms
import os
from config import Config
from .models import DualStreamFakeNewsModel, TextOnlyFakeNewsModel
from .translation_service import translate_to_english, translate_reason_to_vietnamese

# Cấu hình Tesseract linh hoạt (Tránh lỗi khi mang sang máy khác)
tesseract_path = getattr(Config, "TESSERACT_CMD", r'C:\Program Files\Tesseract-OCR\tesseract.exe')
pytesseract.pytesseract.tesseract_cmd = tesseract_path

# Đặt biến môi trường tự động lấy đường dẫn tuyệt đối thư mục backend
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ['TESSDATA_PREFIX'] = os.path.join(backend_dir, 'tessdata')

NO_TEXT_CONTEXT = "no text context"

_model = None
_text_model = None
_text_model_available = False
_tokenizer = None
_transform = None
_clip_model = None
_clip_processor = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def _load_model():
    """Load both Multimodal and Text-Only models"""
    global _model, _text_model, _text_model_available, _tokenizer, _transform, device, _clip_model, _clip_processor
    
    if _model is None:
        _model = DualStreamFakeNewsModel().to(device)
        if not os.path.exists(Config.MODEL_PATH):
            raise RuntimeError(f"Hệ thống chưa được cài đặt Model Weights tại: {Config.MODEL_PATH}. Vui lòng tải file best_model_v2.pth và đặt vào thư mục model_weights.")
        _model.load_state_dict(torch.load(Config.MODEL_PATH, map_location=device, weights_only=True))
        _model.eval()
        
        _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')  # nosec B615
        _transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    # Text-only model removed as part of multimodal-only strategy
    _text_model_available = False


    if _clip_model is None:
        print("[Info] Loading CLIP model for semantic alignment (Dual-Engine)...")
        _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)  # nosec B615
        _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")  # nosec B615
        _clip_model.eval()
        print("[Info] CLIP model loaded successfully!")

def clean_extracted_text(raw_text: str) -> str:
    text = str(raw_text).lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'\[.*?\]|\(.*?\)', '', text)
    # Giong ban cu nhung KHONG xoa tieng Viet, giu lai chu va so, loai bo ky tu dac biet
    text = re.sub(r'[^\w\s]', '', text) 
    clean_text = " ".join(text.split())
    # Fix 5: Text qua ngan (< 10 ky tu) thuong la rac OCR -> bo qua
    return clean_text if clean_text and len(clean_text) >= 10 else NO_TEXT_CONTEXT

def _is_valid_ocr_text(text: str) -> bool:
    """Fix 2: Kiem tra text OCR co du chat luong de dua vao model khong"""
    if not text or text == NO_TEXT_CONTEXT:
        return False
    # Qua ngan (< 10 ky tu thuc) -> rac
    if len(text.strip()) < 10:
        return False
    # Ty le chu cai phai > 50%, neu khong -> rac (so, ky tu dac biet)
    alpha_count = sum(1 for c in text if c.isalpha())
    if len(text) > 0 and alpha_count / len(text) < 0.5:
        return False
    return True

def separate_pixels_and_text(pil_image: Image.Image):
    """Thuật toán (Mới): Đọc chữ trên ảnh nhưng KHÔNG bôi xóa ảnh gốc"""
    try:
        extracted_text = pytesseract.image_to_string(pil_image, lang='vie+eng').strip()
        return pil_image, clean_extracted_text(extracted_text)
    except Exception as e:
        print(f"[OCR Warning] Tesseract khong kha dung, bo qua OCR: {e}")
        return pil_image, NO_TEXT_CONTEXT

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
    reason = _build_dynamic_reason(label, prob_fake_txt=prob_fake)
    # Fix 4: Debug logging
    print(f"[DEBUG TextModel] prob_real={prob_real:.4f} | prob_fake={prob_fake:.4f} | label={label} | confidence={confidence:.4f}")

    return {
        "label": label,
        "confidence": confidence,
        "prob_fake": prob_fake,
        "reason": reason
    }

def _build_dynamic_reason(label, prob_fake_img=None, prob_fake_txt=None, cos_sim=None):
    """Sinh ly do AI cu the dua tren diem so thuc te cua tung yeu to.
    CLIP cos_sim phan bo thuc te: 0.10 (khong lien quan) den 0.40+ (rat lien quan).
    Moi yeu to duoc danh gia trung thuc theo muc diem."""
    
    if label == "REAL":
        parts = []
        warnings = []
        # --- Text ---
        if prob_fake_txt is not None:
            if prob_fake_txt < 0.35:
                parts.append("Ngôn từ nhất quán, không giật tít")
            elif prob_fake_txt < 0.50:
                parts.append("Ngôn từ tương đối bình thường nhưng có vài điểm cần lưu ý")
            else:
                warnings.append("Lưu ý: Văn bản có dấu hiệu bất thường")
        # --- Image ---
        if prob_fake_img is not None:
            if prob_fake_img < 0.35:
                parts.append("Hình ảnh tự nhiên, không phát hiện đặc trưng cắt ghép hay thao túng")
            elif prob_fake_img < 0.50:
                parts.append("Hình ảnh có vài chi tiết đồ họa cần xem xét thêm")
            else:
                warnings.append("Lưu ý: Hình ảnh mang một số đặc trưng thường thấy ở tin giả")
        # --- CLIP Semantic (dùng ngưỡng thực tế của CLIP) ---
        if cos_sim is not None:
            if cos_sim >= 0.35:
                parts.append("Nội dung văn bản và hình ảnh minh họa hoàn toàn khớp ngữ cảnh")
            elif cos_sim >= 0.25:
                parts.append("Hình ảnh có sự liên quan nhất định đến nội dung bài viết")
            elif cos_sim >= 0.15:
                warnings.append("Lưu ý: Bức ảnh minh họa mang tính chất chung chung, độ liên kết với bài viết chưa cao")
            else:
                warnings.append("Cảnh báo: Ảnh đính kèm có dấu hiệu lệch pha hoàn toàn với nội dung văn bản")
        
        result_parts = parts + warnings
        return ". ".join(result_parts) + "." if result_parts else "Nội dung tin cậy sau khi kiểm chứng chéo."
    else:  # FAKE
        factors = []
        # --- Image ---
        if prob_fake_img is not None:
            if prob_fake_img > 0.6:
                factors.append("hình ảnh mang đặc trưng thao túng/tin giả rõ ràng")
            elif prob_fake_img > 0.4:
                factors.append("hình ảnh có một số chi tiết nghi vấn")
        # --- Text ---
        if prob_fake_txt is not None:
            if prob_fake_txt > 0.6:
                factors.append("lối viết giật tít, sai lệch thông tin rõ rệt")
            elif prob_fake_txt > 0.4:
                factors.append("văn phong có dấu hiệu câu view, bất thường")
        # --- CLIP Semantic (dùng ngưỡng thực tế) ---
        if cos_sim is not None and cos_sim < 0.15:
            factors.append("ảnh và văn bản hoàn toàn sai lệch ngữ cảnh")
        elif cos_sim is not None and cos_sim < 0.25:
            factors.append("hình ảnh minh họa không khớp với câu chuyện được kể")
        
        if factors:
            return "Phát hiện " + "; ".join(factors) + "."
        # Fallback nếu điểm sát ngưỡng
        if prob_fake_img is not None and prob_fake_txt is not None:
            return "Kết hợp phân tích đa phương thức cho thấy nhiều điểm nghi vấn."
        if prob_fake_img is not None:
            return "Phân tích hình ảnh phát hiện dấu hiệu bất thường."
        if prob_fake_txt is not None:
            return "Phân tích văn bản phát hiện dấu hiệu bất thường."
        return "Phát hiện sự bất thường khi phân tích đa phương thức."

def verify_multimodal(pure_image: Image.Image, pure_text: str):
    """Xu ly image-only hoac multimodal bang DualStreamFakeNewsModel V2 (Semantic Alignment)"""
    global _model, _tokenizer, _transform, device, _clip_model, _clip_processor
    
    inputs = _tokenizer(
        pure_text, add_special_tokens=True, max_length=256,
        padding='max_length', truncation=True, return_tensors='pt'
    ).to(device)

    img_tensor = _transform(pure_image).unsqueeze(0).to(device)

    with torch.no_grad():
        # Lõi 1: TruthGuard V2 (Phân loại)
        logits, _ = _model(inputs['input_ids'], inputs['attention_mask'], img_tensor)
        probabilities = F.softmax(logits, dim=1)
        
        prob_real = probabilities[0][0].item()
        prob_fake = probabilities[0][1].item()
        predicted_class = torch.argmax(logits, dim=1).item()

        # Lõi 2: CLIP Semantic AI (Chấm điểm ngữ cảnh)
        try:
            clip_inputs = _clip_processor(text=[pure_text], images=pure_image, return_tensors="pt", padding=True, truncation=True, max_length=77).to(device)
            clip_outputs = _clip_model(**clip_inputs)
            
            image_embeds = clip_outputs.image_embeds
            text_embeds = clip_outputs.text_embeds
            
            # Normalize embeddings (in case they are not already)
            image_embeds = image_embeds / image_embeds.norm(p=2, dim=-1, keepdim=True)
            text_embeds = text_embeds / text_embeds.norm(p=2, dim=-1, keepdim=True)
            
            cos_sim_val = torch.sum(image_embeds * text_embeds, dim=-1).item()
        except Exception as e:
            print(f"[Warning] CLIP processing error: {e}. Fallback to 1.0")
            cos_sim_val = 1.0

    label = "REAL" if predicted_class == 0 else "FAKE"
    confidence = prob_real if predicted_class == 0 else prob_fake
    reason = _build_dynamic_reason(label, prob_fake_img=prob_fake, cos_sim=cos_sim_val)
    # Debug logging
    print(f"[DEBUG MultiModal] prob_real={prob_real:.4f} | prob_fake={prob_fake:.4f} | cos_sim={cos_sim_val:.4f} | label={label} | confidence={confidence:.4f}")

    return {
        "label": label,
        "confidence": confidence,
        "prob_fake": prob_fake,
        "reason": reason,
        "cos_sim": cos_sim_val
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
        return _analyze_text(original_text, translated_text)
    elif mode == "image":
        return _analyze_image(pil_image)
    elif mode == "multimodal":
        return _analyze_multimodal(pil_image, original_text, translated_text)
    
    return {"error": "Invalid mode"}

def _analyze_text(original_text, translated_text):
    if not _text_model_available:
        return {"error": "Text model is not available", "text_model_available": False}
    
    result = verify_text_only(translated_text or NO_TEXT_CONTEXT)
    return {
            "label": result["label"],
            "confidence": round(result["confidence"], 4),
            "text_score": round(result["prob_fake"], 4),
            "image_score": "N/A",
            "semantic_score": "N/A",
            "ocr_mismatch_score": "N/A",
            "reason": translate_reason_to_vietnamese(result["reason"]),
            "extracted_text": "",
            "original_text": original_text,
            "translated_text": translated_text,
            "text_model_available": True
    }

def _analyze_image(pil_image):
    # OCR bóc chữ
    clean_image, extracted_text = separate_pixels_and_text(pil_image)
    # Fix 2: Kiem tra chat luong OCR truoc khi dich
    if _is_valid_ocr_text(extracted_text):
        final_text = translate_to_english(extracted_text)
    else:
        print(f"[DEBUG] OCR text bi rac, bo qua: '{extracted_text[:50]}...'")
        final_text = NO_TEXT_CONTEXT
    
    if final_text == NO_TEXT_CONTEXT:
        return {
            "label": "UNCERTAIN",
            "confidence": 0.5,
            "text_score": "N/A",
            "image_score": "N/A",
            "semantic_score": "N/A",
            "ocr_mismatch_score": "N/A",
            "reason": "Không tìm thấy văn bản để đối chiếu. Hệ thống đa phương thức yêu cầu cả chữ và ảnh để đưa ra kết luận chính xác.",
            "extracted_text": extracted_text, # hien thi Tieng Viet/goc
            "original_text": "",
            "translated_text": "",
            "text_model_available": _text_model_available
        }

    result = verify_multimodal(clean_image, final_text)
    return {
            "label": result["label"],
            "confidence": round(result["confidence"], 4),
            "text_score": "N/A",
            "image_score": round(result["prob_fake"], 4),
            "semantic_score": round(result.get("cos_sim", -1), 4),
            "ocr_mismatch_score": "N/A",
            "reason": translate_reason_to_vietnamese(result["reason"]),
            "extracted_text": extracted_text, # hien thi Tieng Viet/goc
            "original_text": "",
            "translated_text": "",
            "text_model_available": _text_model_available
    }

def _check_gate2_semantic_alignment(img_result, final_text, original_text, translated_text, extracted_text):
    cos_sim_val = img_result.get("cos_sim", 1.0)
    is_text_valid = final_text != NO_TEXT_CONTEXT

    if is_text_valid and cos_sim_val < Config.COSINE_THRESHOLD:
        print(f"[DEBUG Semantic] cos_sim={cos_sim_val:.4f} < threshold={Config.COSINE_THRESHOLD} -> FAKE (sai ngu canh)")
        clamped_confidence = min(0.9999, 1.0 - cos_sim_val)
        return {
            "label": "FAKE",
            "confidence": round(clamped_confidence, 4),
            "text_score": "N/A",
            "image_score": round(img_result["prob_fake"], 4),
            "semantic_score": round(cos_sim_val, 4),
            "ocr_mismatch_score": "N/A",
            "reason": translate_reason_to_vietnamese(
                "Cảnh báo: Ảnh và văn bản có độ khớp ngữ nghĩa rất thấp. "
                "Có thể ảnh thật, chữ thật nhưng bị ghép sai ngữ cảnh."
            ),
            "extracted_text": extracted_text,
            "original_text": original_text,
            "translated_text": translated_text,
            "text_model_available": _text_model_available
        }
    return None

def _check_gate3_ocr_fact_check(extracted_text, translated_text, img_result, original_text):
    if not (translated_text and _is_valid_ocr_text(extracted_text) and len(extracted_text) > 15):
        return None
        
    global _clip_processor, _clip_model, device
    if _clip_model is None or _clip_processor is None:
        return None
        
    try:
        ocr_english = translate_to_english(extracted_text)
        clip_text_inputs = _clip_processor(text=[translated_text, ocr_english], return_tensors="pt", padding=True, truncation=True, max_length=77).to(device)
        
        with torch.no_grad():
            clip_outputs = _clip_model.text_model(**clip_text_inputs)
            text_embeds = _clip_model.text_projection(clip_outputs.pooler_output)
            text_embeds = text_embeds / text_embeds.norm(p=2, dim=-1, keepdim=True)
            ocr_cos_sim = torch.sum(text_embeds[0] * text_embeds[1]).item()
        
        print(f"[DEBUG OCR CrossCheck] ocr_cos_sim={ocr_cos_sim:.4f}")
        
        if ocr_cos_sim < 0.82:
            print(f"[DEBUG OCR CrossCheck] FAKE detected! OCR Text and Article Text mismatch.")
            clamped_confidence = min(0.9999, 1.4 - ocr_cos_sim)
            cos_sim_val = img_result.get("cos_sim", 1.0)
            return {
                "label": "FAKE",
                "confidence": round(clamped_confidence, 4),
                "text_score": "N/A",
                "image_score": round(img_result["prob_fake"], 4),
                "semantic_score": round(cos_sim_val, 4),
                "ocr_mismatch_score": round(1.0 - ocr_cos_sim, 4),
                "reason": translate_reason_to_vietnamese(
                    "Phát hiện tin giả tinh vi (Treo đầu dê bán thịt chó): "
                    "Văn bản bên trong bức ảnh hoàn toàn mâu thuẫn với nội dung bài báo đang viết."
                ),
                "extracted_text": extracted_text,
                "original_text": original_text,
                "translated_text": translated_text,
                "text_model_available": _text_model_available
            }
    except Exception as e:
        print(f"[Warning] OCR CrossCheck error: {e}")
    return None

def _combine_final_results(img_result, text_result, original_text, translated_text, extracted_text):
    cos_sim_val = img_result.get("cos_sim", 1.0)
    
    if _text_model_available and original_text and text_result:
        combined_prob_fake = (img_result["prob_fake"] + text_result["prob_fake"]) / 2
        FAKE_THRESHOLD = 0.6
        print(f"[DEBUG Multimodal] combined_prob_fake={combined_prob_fake:.4f} | threshold={FAKE_THRESHOLD} | cos_sim={cos_sim_val:.4f}")
        
        if combined_prob_fake > FAKE_THRESHOLD:
            label = "FAKE"
            confidence = combined_prob_fake
        else:
            label = "REAL"
            confidence = 1 - combined_prob_fake
            if cos_sim_val > 0.25:
                confidence = min(0.99, confidence + (cos_sim_val - 0.20) * 1.5)
        reason = _build_dynamic_reason(label, prob_fake_img=img_result["prob_fake"], prob_fake_txt=text_result["prob_fake"], cos_sim=cos_sim_val)
            
        return {
            "label": label,
            "confidence": round(confidence, 4),
            "text_score": round(text_result["prob_fake"], 4),
            "image_score": round(img_result["prob_fake"], 4),
            "semantic_score": round(cos_sim_val, 4),
            "ocr_mismatch_score": "N/A",
            "reason": translate_reason_to_vietnamese(reason),
            "extracted_text": extracted_text,
            "original_text": original_text,
            "translated_text": translated_text,
            "text_model_available": True
        }
    else:
        label = img_result["label"]
        confidence = img_result["confidence"]
        if label == "REAL" and cos_sim_val > 0.15:
            confidence = min(0.95, confidence + (cos_sim_val - 0.15) * 2.0)

        return {
            "label": label,
            "confidence": round(confidence, 4),
            "text_score": "N/A",
            "image_score": round(img_result["prob_fake"], 4),
            "semantic_score": round(cos_sim_val, 4),
            "ocr_mismatch_score": "N/A",
            "reason": translate_reason_to_vietnamese(img_result["reason"]),
            "extracted_text": extracted_text,
            "original_text": original_text,
            "translated_text": translated_text,
            "text_model_available": _text_model_available
        }

def _analyze_multimodal(pil_image, original_text, translated_text):
    clean_image, extracted_text = separate_pixels_and_text(pil_image)
    if translated_text:
        final_text = translated_text
    elif _is_valid_ocr_text(extracted_text):
        final_text = translate_to_english(extracted_text)
    else:
        print(f"[DEBUG] OCR text bi rac trong multimodal, bo qua: '{extracted_text[:50]}...'")
        final_text = NO_TEXT_CONTEXT
    
    if final_text == NO_TEXT_CONTEXT:
        return {
            "label": "UNCERTAIN",
            "confidence": 0.5,
            "text_score": "N/A",
            "image_score": "N/A",
            "semantic_score": "N/A",
            "ocr_mismatch_score": "N/A",
            "reason": "Không tìm thấy văn bản để đối chiếu. Hệ thống đa phương thức yêu cầu cả chữ và ảnh để đưa ra kết luận chính xác.",
            "extracted_text": extracted_text,
            "original_text": original_text,
            "translated_text": translated_text,
            "text_model_available": _text_model_available
        }

    img_result = verify_multimodal(clean_image, final_text)

    gate2_result = _check_gate2_semantic_alignment(img_result, final_text, original_text, translated_text, extracted_text)
    if gate2_result: return gate2_result

    gate3_result = _check_gate3_ocr_fact_check(extracted_text, translated_text, img_result, original_text)
    if gate3_result: return gate3_result

    text_result = verify_text_only(translated_text) if (_text_model_available and original_text) else None
    
    return _combine_final_results(img_result, text_result, original_text, translated_text, extracted_text)