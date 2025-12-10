# Stage 1: Build the React Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files first for better caching
COPY photo-frame-client/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY photo-frame-client/ .

# Build the static files (outputs to /app/client/dist)
RUN npm run build


# Stage 2: Final PocketBase Image
FROM alpine:latest

ARG PB_VERSION=0.34.2

# Install required runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip

# Copy Backend Migrations
# We create the directory first just in case
RUN mkdir -p /pb/pb_migrations
COPY backend/pb_migrations /pb/pb_migrations

# Copy Frontend Build to pb_public
# PocketBase automatically serves index.html from pb_public for the root URL
COPY --from=frontend-builder /app/client/dist /pb/pb_public

# Expose the API/Web port
EXPOSE 8090

# Set working directory
WORKDIR /pb

# Run PocketBase
# Listen on all interfaces (0.0.0.0) so Docker maps it correctly
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
