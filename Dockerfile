FROM node:24-alpine AS base
WORKDIR /app
COPY package.json ./
COPY apps/gateway/package.json apps/gateway/package.json
COPY apps/orders-service/package.json apps/orders-service/package.json
COPY apps/products-service/package.json apps/products-service/package.json
COPY apps/realtime-service/package.json apps/realtime-service/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
RUN npm install
COPY . .
ARG GATEWAY_URL=http://gateway:3000
ENV GATEWAY_URL=$GATEWAY_URL
RUN npm run db:generate && npm run build

FROM base AS gateway
CMD ["node", "apps/gateway/dist/main.js"]

FROM base AS orders
CMD ["node", "apps/orders-service/dist/main.js"]

FROM base AS products
CMD ["node", "apps/products-service/dist/main.js"]

FROM base AS realtime
CMD ["node", "apps/realtime-service/dist/main.js"]

FROM base AS web
CMD ["npm", "run", "start", "-w", "@inventory/web"]
