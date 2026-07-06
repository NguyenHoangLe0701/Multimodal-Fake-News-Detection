<div align="center">
  <img src="https://raw.githubusercontent.com/NguyenHoangLe0701/Multimodal-Fake-News-Detection/main/frontend/public/favicon.svg" alt="Logo" width="100" height="100">
  
  # 🕵️‍♂️ Multimodal Fake News Detection
  
  **Hệ thống phát hiện tin giả đa phương thức (Text + Image) bằng AI**

  [![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## 🌟 Giới thiệu Dự án

Dự án **Multimodal Fake News Detection** là một hệ thống toàn diện sử dụng trí tuệ nhân tạo để phân tích và đánh giá độ tin cậy của tin tức. Hệ thống không chỉ dựa vào nội dung văn bản (Text) mà còn phân tích cả hình ảnh đính kèm (Image) để đưa ra dự đoán chính xác hơn về việc một tin tức là **Thật (REAL)** hay **Giả (FAKE)**. 

Hệ thống có khả năng tự động trích xuất văn bản từ hình ảnh (OCR) và dịch ngôn ngữ tự động để phân tích dữ liệu đa quốc gia.

## ✨ Tính năng nổi bật

- 📝 **Phân tích Văn bản (NLP):** Áp dụng mô hình Transformer (BERT) để trích xuất đặc trưng và phân tích ngữ nghĩa, giọng điệu, từ khóa bất thường.
- 🖼️ **Phân tích Hình ảnh (Computer Vision):** Sử dụng ResNet50 (CNN) để trích xuất đặc trưng hình ảnh kết hợp với bối cảnh bài viết.
- 🔗 **Multimodal Fusion:** Kết hợp sức mạnh của cả hai luồng dữ liệu (Dual-Stream: Text + Image) để cho ra một Độ tin cậy (Confidence Score) chính xác nhất.
- 🔤 **Tích hợp OCR & Dịch Thuật:** Tự động nhận diện chữ trong ảnh (Tesseract OCR) và dịch nội dung tiếng Việt sang tiếng Anh (Deep Translator) để đưa vào mô hình học sâu.
- ⚡ **Giao diện Trực quan & Mượt mà:** Ứng dụng React 19 với TailwindCSS v4 và Framer Motion cung cấp trải nghiệm hiện đại, thân thiện, kết quả được biểu diễn bằng đồ thị sinh động.
- ☁️ **Lưu trữ Cloud & Quản trị:** Quản lý người dùng, phân quyền Admin và lưu trữ lịch sử bằng Supabase (PostgreSQL & Storage).

---

## 📋 Yêu cầu Hệ thống (User Requirement)

Sơ đồ quy trình nghiệp vụ và luồng xử lý AI của hệ thống từ lúc nhận yêu cầu (Input) đến lúc ra kết quả (Output).

<div align="center">
  <img src="https://raw.githubusercontent.com/NguyenHoangLe0701/Multimodal-Fake-News-Detection/main/frontend/public/user_requirements.jpg?v=1" alt="User Requirement Diagram" style="border-radius: 8px;">
</div>

---

## 🏗️ Kiến trúc Hệ thống

Hệ thống được thiết kế theo mô hình Microservices, chia làm các module độc lập tương tác qua RESTful API.

```mermaid
graph TD
    subgraph Client [Frontend - React/Vite]
        UI[User Interface]
        Upload[Upload Text & Image]
        Dashboard[Admin & History Dashboard]
    end

    subgraph Server [Backend - FastAPI]
        API[FastAPI Endpoints]
        Auth[Supabase Middleware]
        Logic[Business Logic]
    end

    subgraph AI [AI Engine - PyTorch]
        OCR[Tesseract OCR]
        Translation[Deep Translator]
        TextModel[BERT Encoder]
        ImageModel[ResNet50 Encoder]
        Fusion[Multimodal Fusion & Classifier]
    end

    subgraph Cloud [Cloud Data - Supabase]
        DB[(PostgreSQL)]
        Bucket[Storage Bucket]
    end

    UI --> |Upload Text/Image| Upload
    Upload --> |HTTP POST /api/predict| API
    
    API <--> |Verify Token| Auth
    API --> |Save Image| Bucket
    API --> |Forward Text + Image| AI
    
    AI --> |Extract Text from Image| OCR
    AI --> |Translate to English| Translation
    Translation --> TextModel
    AI --> |Image Tensor| ImageModel
    
    TextModel --> Fusion
    ImageModel --> Fusion
    Fusion --> |Return FAKE/REAL & Confidence| Logic
    
    Logic --> |Save Result| DB
    Logic --> |Return JSON| Dashboard
```

---

## 💻 Công nghệ Sử dụng

| Frontend (Web Client) | Backend (API Server) | AI & Machine Learning | Database & Cloud |
| :--- | :--- | :--- | :--- |
| **React 19** (Vite) | **FastAPI** (Python 3.10+) | **PyTorch** | **Supabase** (PostgreSQL) |
| **Tailwind CSS v4** | Uvicorn (ASGI Server) | Transformers (BERT) | Supabase Storage |
| Framer Motion | Pydantic | OpenCV & Pillow | Supabase Auth |
| Lucide React & Recharts | Python-Dotenv | Tesseract OCR | |

---

## 📁 Cấu trúc Thư mục

```text
Multimodal-Fake-News-Detection/
├── frontend/             # Ứng dụng Web Client (React 19 + Vite)
│   ├── src/              # Mã nguồn React (Pages, Components, Services)
│   └── package.json      # Cấu hình thư viện Frontend
├── backend/              # API Server (FastAPI)
│   ├── app/              # Logic xử lý API, Auth, Database
│   ├── model_weights/    # Chứa file weights (.pth) của mô hình AI
│   └── requirements.txt  # Cấu hình thư viện Python
├── training/             # (Tùy chọn) Script tiền xử lý và huấn luyện AI Model
├── docs/                 # Tài liệu thiết kế hệ thống, API specs
└── README.md             # Tổng quan dự án (File này)
```

---

## 🚀 Cài đặt và Khởi chạy (Local Development)

### 1. Clone repository
```bash
git clone https://github.com/NguyenHoangLe0701/Multimodal-Fake-News-Detection.git
cd Multimodal-Fake-News-Detection
```

### 2. Thiết lập Backend (FastAPI & AI)
Yêu cầu hệ thống cài đặt sẵn [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki). Trên Windows có thể cài qua: `winget install -e --id UB-Mannheim.TesseractOCR`

```bash
cd backend
python -m venv venv

# Activate venv:
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt
```

**Cấu hình môi trường Backend:**
Tạo file `.env` trong thư mục `backend/` và điền thông tin Supabase của bạn:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

**Khởi chạy Backend:**
```bash
python run.py
```
API sẽ chạy tại: `http://127.0.0.1:8000`

### 3. Thiết lập Frontend (React)
```bash
cd frontend
npm install
```

**Cấu hình môi trường Frontend:**
Tạo file `.env` trong thư mục `frontend/`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Khởi chạy Frontend:**
```bash
npm run dev
```
Truy cập `http://localhost:5173` để trải nghiệm ứng dụng.

---

## 🛡️ License

Dự án được thực hiện cho mục đích học tập và nghiên cứu. Mọi đóng góp và ý kiến đều được hoan nghênh.
