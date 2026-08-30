FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
RUN npm install -g pm2
COPY --from=builder /app/dist ./dist
# Nếu có thư mục storage tĩnh
# COPY --from=builder /app/storage ./storage 
EXPOSE 8000
# Khởi chạy 2 worker (phù hợp với cpus: '2.0' trong docker-compose)
CMD ["pm2-runtime", "start", "dist/main.js", "-i", "2"]
