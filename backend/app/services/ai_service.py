"""
AI Service — handles model loading and inference.

Currently uses MOCK predictions. When your trained model is ready:
1. Place the .pth file in model_weights/
2. Uncomment the REAL implementation below
3. Update config.py MODEL_PATH if needed
"""
import random


# ─── MOCK Implementation (current) ─────────────────────────────
# Returns random predictions for development & testing.
# Replace with real model once training is complete.

def predict(text, image_path=None):
    """
    Run fake news prediction on text and optional image.

    Args:
        text (str): The news article content.
        image_path (str|None): Local path to the uploaded image file.

    Returns:
        dict: {
            "label": "FAKE" or "REAL",
            "confidence": float (0.0 - 1.0),
            "text_score": float (0.0 - 1.0),
            "image_score": float (0.0 - 1.0),
        }
    """
    # Simulate processing with random scores
    text_score = round(random.uniform(0.3, 0.95), 4)
    image_score = round(random.uniform(0.3, 0.95), 4) if image_path else 0.5

    # Weighted average: text 60%, image 40%
    combined = text_score * 0.6 + image_score * 0.4

    # Threshold: > 0.5 = FAKE
    label = "FAKE" if combined > 0.5 else "REAL"
    confidence = round(combined if label == "FAKE" else 1 - combined, 4)

    # Sinh lý do (reason) dựa trên kết quả
    if label == "FAKE":
        reasons = [
            "Văn bản chứa nhiều từ ngữ mang tính kích động, không có nguồn tin cậy.",
            "Phân tích hình ảnh cho thấy dấu hiệu chỉnh sửa bằng phần mềm (Photoshop/AI).",
            "Nội dung văn bản và hình ảnh đính kèm hoàn toàn mâu thuẫn với nhau."
        ]
        reason = random.choice(reasons)
    else:
        reason = "Văn bản và hình ảnh có tính nhất quán cao, không phát hiện dấu hiệu chỉnh sửa."

    return {
        "label": label,
        "confidence": confidence,
        "text_score": text_score,
        "image_score": image_score,
        "reason": reason,
        "details": {
            "text_analysis": f"Confidence: {int(text_score*100)}%",
            "image_analysis": f"Confidence: {int(image_score*100)}%" if image_path else "No image",
        }
    }


# ─── REAL Implementation (uncomment when model is ready) ───────
#
# import torch
# import cv2
# import numpy as np
# from transformers import AutoTokenizer, AutoModel
# from config import Config
#
# # Load model once at module level
# _model = None
# _tokenizer = None
#
# def _load_model():
#     global _model, _tokenizer
#     if _model is None:
#         # Load your custom multimodal model
#         _model = torch.load(Config.MODEL_PATH, map_location='cpu')
#         _model.eval()
#         _tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
#     return _model, _tokenizer
#
# def predict(text, image_path=None):
#     model, tokenizer = _load_model()
#
#     # Text features
#     inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
#     with torch.no_grad():
#         text_features = model.text_encoder(**inputs)
#
#     # Image features
#     if image_path:
#         img = cv2.imread(image_path)
#         img = cv2.resize(img, (224, 224))
#         img = torch.tensor(img).permute(2, 0, 1).unsqueeze(0).float() / 255.0
#         with torch.no_grad():
#             image_features = model.image_encoder(img)
#     else:
#         image_features = torch.zeros(1, model.image_dim)
#
#     # Fusion + Classification
#     with torch.no_grad():
#         output = model.classifier(text_features, image_features)
#         probs = torch.softmax(output, dim=1)
#         confidence, predicted = torch.max(probs, 1)
#
#     label = "FAKE" if predicted.item() == 1 else "REAL"
#     return {
#         "label": label,
#         "confidence": round(confidence.item(), 4),
#         "text_score": round(probs[0][1].item(), 4),
#         "image_score": round(probs[0][1].item(), 4),
#     }
