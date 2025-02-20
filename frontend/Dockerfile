# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install vite --save-dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "--port", "3000"]