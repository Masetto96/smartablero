# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build


# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx configuration
RUN rm /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
# Remove default nginx static assets
RUN rm -rf ./*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
# # Copy static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]