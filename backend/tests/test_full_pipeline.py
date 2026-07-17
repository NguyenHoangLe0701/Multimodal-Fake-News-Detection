import os
import requests
import json
import sys
import time

# Cấu hình API Endpoint
BASE_URL = "http://127.0.0.1:8000"
API_PREDICT = f"{BASE_URL}/api/predict/"
API_PREDICT_VIDEO = f"{BASE_URL}/api/predict-video/"

# Lấy đường dẫn thư mục gốc dự án (để trỏ tới thư mục test_dataset và video)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEST_DIR = os.path.join(PROJECT_ROOT, "test_dataset")

# Đường dẫn file thật
REAL_IMAGE_PATH = os.path.join(TEST_DIR, "lu_lut_yagi.jpg")
# Đường dẫn video test do bạn cung cấp
VIDEO_PATH = os.path.join(PROJECT_ROOT, "video", "7.mp4")

def print_banner(title):
    print("\n" + "="*80)
    print(f"▶ CHẠY KIỂM THỬ: {title}")
    print("="*80)

def print_result(response, processing_time, is_video=False):
    print(f"\n[⏱️] Thời gian xử lý AI (Latency): {processing_time:.2f} giây")
    
    if response.status_code == 200:
        data = response.json().get("data", {})
        
        # In ra màn hình với format đẹp mắt để giảng viên đọc
        print(f"\n[+] KẾT QUẢ CUỐI CÙNG: >> {data.get('label')} <<")
        print(f"    - Độ tự tin (Confidence): {data.get('confidence')}%")
        print(f"    - Lý do hệ thống kết luận: {data.get('reason')}")
        
        print("\n[+] BÓC TÁCH DÒNG CHẢY DỮ LIỆU (CHỨNG MINH PIPELINE HOẠT ĐỘNG):")
        
        if is_video:
            video_score = data.get('videoScore')
            print(f"    1. Mô hình Video (3D ResNet): Đã phân tích không gian và thời gian (chuyển động của frame).")
            print(f"    2. Điểm nghi vấn Deepfake: {video_score}")
            if data.get('label') == "FAKE":
                print("       => [CẢNH BÁO FAKE] Phát hiện khung hình bị thao túng (ví dụ: lỗi lip-sync, face-swap).")
            else:
                print("       => [HỢP LỆ] Video có chuyển động tự nhiên.")
        else:
            text_score = data.get('text_score')
            image_score = data.get('image_score')
            semantic_score = data.get('semantic_score')
            
            if text_score is not None:
                print(f"    1. Mô hình Text (BERT): Đánh giá văn bản độc lập -> Điểm: {text_score}")
            if image_score is not None:
                print(f"    2. Mô hình Ảnh (ResNet): Đánh giá hình ảnh độc lập -> Điểm: {image_score}")
            if semantic_score not in [None, "N/A"]:
                # Nhấn mạnh phần CLIP Gate
                print(f"    3. Cổng CLIP Gate (Quan trọng): Đo độ lệch pha giữa Text và Ảnh -> Điểm: {semantic_score}")
                if data.get('label') == "FAKE" and float(semantic_score) < 0.25:
                    print("       => [CẢNH BÁO FAKE] Hệ thống CLIP Gate phát hiện LỆCH NGỮ CẢNH! Ảnh và Chữ không liên quan!")
                else:
                    print("       => [HỢP LỆ] Hệ thống đánh giá Ảnh và Chữ khớp ngữ cảnh.")
    else:
        print(f"\n[-] LỖI API: HTTP {response.status_code}")
        print(response.text)


def run_demo():
    print("🚀 BẮT ĐẦU CHẠY SCRIPT DEMO BẢO VỆ ĐỒ ÁN (BỔ SUNG ĐO LƯỜNG LATENCY)")
    
    # 1. Kiểm tra Backend
    try:
        requests.get(BASE_URL)
    except:
        print("\n[!] LỖI: Không kết nối được Backend. Hãy chạy 'python run.py' ở terminal khác trước nhé!")
        sys.exit(1)

    # 2. Kiểm tra dữ liệu demo
    if not os.path.exists(REAL_IMAGE_PATH):
        print(f"\n[!] LỖI: Thiếu ảnh test {REAL_IMAGE_PATH}")
        sys.exit(1)

    # ---------------------------------------------------------
    # KỊCH BẢN 1: ẢNH VÀ CHỮ HOÀN TOÀN KHỚP NHAU (TIN THẬT)
    # ---------------------------------------------------------
    print_banner("Kịch bản 1: Tin Thật (Ảnh và Nội dung khớp nhau)")
    text_match = "Đội cứu hộ đang tích cực hỗ trợ người dân trong khu vực ngập lụt." 
    
    with open(REAL_IMAGE_PATH, "rb") as img_file:
        files = {"image": ("lu_lut_yagi.jpg", img_file, "image/jpeg")}
        data = {"text": text_match, "mode": "multimodal"}
        
        start_time = time.time()
        response = requests.post(API_PREDICT, files=files, data=data)
        processing_time = time.time() - start_time
        
        print_result(response, processing_time)

    # ---------------------------------------------------------
    # KỊCH BẢN 2: ẢNH THẬT NHƯNG CHỮ SAI SỰ THẬT (TIN GIẢ DO LỆCH NGỮ CẢNH)
    # ---------------------------------------------------------
    print_banner("Kịch bản 2: Tin Giả (Râu ông nọ cắm cằm bà kia)")
    print("=> Chú thích: Vẫn dùng bức ảnh ngập lụt đó, nhưng thay đổi caption thành một sự kiện khác.")
    text_out_of_context = "Hướng dẫn cách làm bánh bông lan trứng muối bằng nồi chiên không dầu." 
    
    with open(REAL_IMAGE_PATH, "rb") as img_file:
        files = {"image": ("lu_lut_yagi.jpg", img_file, "image/jpeg")}
        data = {"text": text_out_of_context, "mode": "multimodal"}
        
        start_time = time.time()
        response = requests.post(API_PREDICT, files=files, data=data)
        processing_time = time.time() - start_time
        
        print_result(response, processing_time)

    # ---------------------------------------------------------
    # KỊCH BẢN 3: VIDEO DEEPFAKE
    # ---------------------------------------------------------
    print_banner("Kịch bản 3: Video Deepfake")
    if not os.path.exists(VIDEO_PATH):
        print(f"[!] LỖI: Không tìm thấy file video tại: {VIDEO_PATH}")
        print("    Vui lòng kiểm tra lại đường dẫn video.")
    else:
        print(f"=> Đang phân tích video: {VIDEO_PATH}")
        print("   (Lưu ý: Xử lý video bằng 3D ResNet sẽ tốn nhiều thời gian và tài nguyên CPU/GPU hơn so với ảnh tĩnh...)")
        
        with open(VIDEO_PATH, "rb") as video_file:
            files = {"video": ("7.mp4", video_file, "video/mp4")}
            data = {"user_email": "demo@example.com"}
            
            start_time = time.time()
            response = requests.post(API_PREDICT_VIDEO, files=files, data=data)
            processing_time = time.time() - start_time
            
            print_result(response, processing_time, is_video=True)


if __name__ == "__main__":
    run_demo()
