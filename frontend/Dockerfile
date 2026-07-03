# Stage 1: Build ứng dụng React với Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Chỉ copy package.json và package-lock.json trước để tận dụng cache
COPY package*.json ./

# Cài đặt dependencies (sử dụng ci để cài đặt chính xác các versions)
RUN npm ci

# Tránh copy đệ quy theo chuẩn bảo mật (docker:S6470)
COPY index.html vite.config.js vitest.config.js eslint.config.js ./
COPY public ./public
COPY src ./src

# Build Vite app thành các file static
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginxinc/nginx-unprivileged:alpine

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy các file static đã được build từ Stage 1 sang thư mục html của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx custom (để support React Router SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 cho container (vì user thường không được bind port 80)
EXPOSE 8080

# Chạy Nginx ở foreground
CMD ["nginx", "-g", "daemon off;"]
