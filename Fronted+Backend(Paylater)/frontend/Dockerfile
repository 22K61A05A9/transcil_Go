# Step 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite environment variables are required at build time
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# Step 2: Serve stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Allow nginx to run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html \
    /var/cache/nginx \
    /var/log/nginx \
    /etc/nginx/conf.d \
    /run \
    /tmp

# nginx master process runs as nginx
RUN sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]