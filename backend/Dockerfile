# Sử dụng base image Python tối ưu (slim)
FROM python:3.10-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV và PyTorch
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt thư viện Python trước để tận dụng cache Docker
COPY requirements.txt .

# Cài đặt gunicorn để chạy server trên môi trường production thay vì Flask dev server
RUN pip install --no-cache-dir gunicorn
RUN pip install --no-cache-dir -r requirements.txt

# Tránh copy đệ quy theo chuẩn bảo mật (docker:S6470)
COPY run.py config.py pytest.ini ./
COPY app ./app

# Tạo thư mục uploads nếu chưa có và phân quyền cho non-root user
RUN mkdir -p uploads && \
    adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

# Switch sang non-root user (docker:S6471)
USER appuser

# Expose port (Backend chạy cổng 5000)
EXPOSE 5000

# Chạy ứng dụng bằng Gunicorn thay vì python run.py để ổn định và chịu tải tốt hơn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "run:app"]
