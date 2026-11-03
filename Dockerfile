FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/gateway/package.json backend/gateway/package.json
COPY backend/orders-service/package.json backend/orders-service/package.json
COPY backend/products-service/package.json backend/products-service/package.json
COPY backend/realtime-service/package.json backend/realtime-service/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build

FROM base AS gateway
CMD ["node", "backend/gateway/dist/main.js"]

FROM base AS orders
CMD ["node", "backend/orders-service/dist/main.js"]

FROM base AS products
CMD ["node", "backend/products-service/dist/main.js"]

FROM base AS realtime
CMD ["node", "backend/realtime-service/dist/main.js"]

FROM nginx:1.27-alpine AS web
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /app/frontend/dist /usr/share/nginx/html
