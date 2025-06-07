FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Update environment variable for HTTPS
ENV VITE_SOCKET_SERVER=https://dev-suhu.umm.ac.id

RUN npm run build

FROM nginx:stable-alpine

# Install openssl for SSL support
RUN apk add --no-cache openssl

# Create SSL directories
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy SSL certificates
COPY certs/ca-umm.crt /etc/ssl/certs/ca-umm.crt
COPY certs/umm.key /etc/ssl/private/umm.key

# Set proper permissions for SSL files
RUN chmod 644 /etc/ssl/certs/ca-umm.crt && \
    chmod 600 /etc/ssl/private/umm.key && \
    chown root:root /etc/ssl/certs/ca-umm.crt /etc/ssl/private/umm.key

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]