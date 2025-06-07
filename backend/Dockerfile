FROM node:18-alpine

WORKDIR /app

# Install openssl for SSL support
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Create SSL directories
RUN mkdir -p /app/certs

# Copy SSL certificates
COPY certs/ca-umm.crt /app/certs/ca-umm.crt
COPY certs/umm.key /app/certs/umm.key

# Set proper permissions for SSL files
RUN chmod 644 /app/certs/ca-umm.crt && \
    chmod 600 /app/certs/umm.key && \
    chown root:root /app/certs/ca-umm.crt /app/certs/umm.key

EXPOSE 3000 3001

CMD ["node", "server.js"]