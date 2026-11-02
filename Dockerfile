FROM node:24-alpine AS base
WORKDIR /app
COPY package.json ./
COPY backend/gateway/package.json backend/gateway/package.json
COPY backend/orders-service/package.json backend/orders-service/package.json
COPY backend/products-service/package.json backend/products-service/package.json
COPY backend/realtime-service/package.json backend/realtime-service/package.json
COPY frontend/package.json frontend/package.json
COPY packages/database/package.json packages/database/package.json
RUN npm install
COPY . .
ARG GATEWAY_URL=http://gateway:3000
ENV GATEWAY_URL=$GATEWAY_URL
RUN npm run db:generate && npm run build

FROM base AS gateway
CMD ["node", "backend/gateway/dist/main.js"]

FROM base AS orders
CMD ["node", "backend/orders-service/dist/main.js"]

FROM base AS products
CMD ["node", "backend/products-service/dist/main.js"]

FROM base AS realtime
CMD ["node", "backend/realtime-service/dist/main.js"]

FROM base AS web
CMD ["npm", "run", "start", "-w", "@inventory/web"]
