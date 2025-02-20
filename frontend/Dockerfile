# Build stage
FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN ls -la dist/ # Debug: Check build output

# Serve stage
FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./
RUN ls -la dist/ # Debug: Verify copied files
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "--port", "3000"]