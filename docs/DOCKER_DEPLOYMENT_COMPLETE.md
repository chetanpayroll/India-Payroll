# 🐳 PAYROLLNEXUS-INDIA: DEVOPS & DEPLOYMENT
## Production-Ready Infrastructure

This document contains the complete configuration for Docker, Nginx, and Deployment.

---

## 🐋 DOCKER CONFIGURATION

### File: `docker-compose.yml` (Production Ready)

```yaml
version: '3.8'

services:
  # ==========================================
  # DATABASE
  # ==========================================
  postgres:
    image: postgres:15-alpine
    container_name: payrollnexus-db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-payroll_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-payroll_secret_2025}
      POSTGRES_DB: ${POSTGRES_DB:-payrollnexus}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - payroll-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-payroll_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # CACHE & QUEUE
  # ==========================================
  redis:
    image: redis:7-alpine
    container_name: payrollnexus-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - payroll-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # BACKEND API
  # ==========================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: payrollnexus-api
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-payroll_user}:${POSTGRES_PASSWORD:-payroll_secret_2025}@postgres:5432/${POSTGRES_DB:-payrollnexus}?schema=public
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-production_secret_key_change_me}
      PORT: 3000
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3001}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - payroll-network

  # ==========================================
  # FRONTEND APP
  # ==========================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: payrollnexus-web
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000/api/v1}
    ports:
      - "3001:3000"
    depends_on:
      - backend
    networks:
      - payroll-network

  # ==========================================
  # REVERSE PROXY (Optional for Local)
  # ==========================================
  nginx:
    image: nginx:alpine
    container_name: payrollnexus-proxy
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
    depends_on:
      - backend
      - frontend
    networks:
      - payroll-network

volumes:
  postgres_data:
  redis_data:

networks:
  payroll-network:
    driver: bridge
```

### File: `backend/Dockerfile`

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### File: `frontend/Dockerfile`

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🌐 NGINX CONFIGURATION

### File: `nginx/conf.d/default.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🚀 DEPLOYMENT SCRIPT

### File: `deploy.sh`

```bash
#!/bin/bash

# PayrollNexus-India Deployment Script

echo "🚀 Starting Deployment..."

# 1. Pull latest changes
# git pull origin main

# 2. Build and Start Containers
echo "📦 Building containers..."
docker-compose up -d --build

# 3. Wait for Database
echo "⏳ Waiting for database..."
sleep 10

# 4. Run Migrations
echo "🔄 Running database migrations..."
docker-compose exec -T backend npx prisma migrate deploy

# 5. Seed Data (Optional - only for fresh install)
# echo "🌱 Seeding database..."
# docker-compose exec -T backend npx prisma db seed

echo "✅ Deployment Complete!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔌 API: http://localhost:3000/api/v1"
```
