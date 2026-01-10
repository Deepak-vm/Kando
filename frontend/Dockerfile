FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retries 10 \
    && npm config set fetch-retry-mintimeout 10000 \
    && npm config set fetch-timeout 300000 \
    && npm ci --prefer-offline --no-audit

COPY . .



RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]


