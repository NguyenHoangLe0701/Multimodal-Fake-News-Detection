import cv2
import os
import time
import torch
import torch.nn.functional as F
import numpy as np
from typing import Dict, Any, List
from PIL import Image
from torchvision import transforms

from app.services.models import VideoDeepfakeModel
from config import Config

# --- Singleton Model Setup ---
_video_model = None
_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def _get_video_model():
    global _video_model
    if _video_model is None:
        try:
            print("[VideoAI] Đang tải mô hình Video Deepfake...")
            model_path = os.path.join('model_weights', 'best_fake_video_model.pth')
            
            _video_model = VideoDeepfakeModel()
            
            state_dict = torch.load(model_path, map_location=_device)
            if 'module.' in list(state_dict.keys())[0]:
                state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}
                
            _video_model.load_state_dict(state_dict)
            _video_model.to(_device)
            _video_model.eval()
            print("[VideoAI] Tải mô hình thành công!")
        except Exception as e:
            print(f"[VideoAI] Lỗi khi tải mô hình: {e}")
            _video_model = None
    return _video_model


# --- Preprocessing Video ---
video_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def extract_frames_tensor(video_path: str, num_frames: int = 30) -> torch.Tensor:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Không thể mở video.")
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        raise ValueError("Video không hợp lệ hoặc quá ngắn.")
        
    step = max(1, total_frames // num_frames)
    
    extracted_tensors = []
    current_frame_idx = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if current_frame_idx % step == 0 and len(extracted_tensors) < num_frames:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(frame_rgb)
            tensor_img = video_transform(pil_img)
            extracted_tensors.append(tensor_img)
            
        current_frame_idx += 1
        
        if len(extracted_tensors) >= num_frames:
            break
            
    cap.release()
    
    while len(extracted_tensors) < num_frames and len(extracted_tensors) > 0:
        extracted_tensors.append(extracted_tensors[-1])
        
    if not extracted_tensors:
         raise ValueError("Không thể trích xuất khung hình.")
         
    video_tensor = torch.stack(extracted_tensors).permute(1, 0, 2, 3)
    return video_tensor


def analyze_video(video_path: str) -> Dict[str, Any]:
    """
    Pipeline chính để phân tích Video Deepfake bằng mô hình 3D ResNet.
    """
    try:
        print(f"[VideoAI] Bắt đầu phân tích video: {video_path}")
        start_time = time.time()
        
        model = _get_video_model()
        if model is None:
            raise RuntimeError("Mô hình Video AI chưa sẵn sàng.")
            
        # 1. Trích xuất frame thành Tensor (C, F, H, W)
        clip_tensor = extract_frames_tensor(video_path, num_frames=30)
        
        # Thêm batch dimension -> (1, C, F, H, W)
        clip_tensor = clip_tensor.unsqueeze(0).to(_device)
        
        # 2. Xử lý qua Mô hình (Model Inference)
        with torch.no_grad():
            outputs = model(clip_tensor)
            probabilities = F.softmax(outputs, dim=1)
            fake_prob = probabilities[0][1].item()
            
        is_fake = fake_prob > 0.5
        confidence = fake_prob if is_fake else (1.0 - fake_prob)
        
        reason = "Hệ thống AI phát hiện dấu vết bất thường về kết cấu khung hình (spatial) và sự thiếu mượt mà (temporal) giữa các khung hình liên tiếp." if is_fake else "Không phát hiện dấu vết can thiệp AI nổi bật. Video có tính liền mạch tự nhiên."
        
        process_time = time.time() - start_time
        print(f"[VideoAI] Phân tích xong sau {process_time:.2f} giây. Fake Prob: {fake_prob:.4f}")

        return {
            "label": "FAKE" if is_fake else "REAL",
            "confidence": round(confidence, 4),
            "videoScore": round(fake_prob, 4),
            "reason": reason,
            "mode": "video"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "error": str(e)
        }
