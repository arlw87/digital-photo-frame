# Deployment Guide (VPS)

Since I cannot build Docker images in this current environment, here is the exact guide to deploy this on your VPS.

## Prerequisites
- A VPS with **runs Docker** and **Docker Compose**.
- A domain name (optional, but recommended) pointed to your VPS IP.

## 1. Transfer Files
You need to copy your project files to the VPS.
**Recommended Method**: Use `rsync` or `scp`.
```bash
# Run this from your local computer
rsync -avz --exclude 'node_modules' --exclude 'pb_data' ./ root@YOUR_VPS_IP:/opt/photo-frame
```

## 2. Build and Run on VPS

### Option A: Use Docker Compose (Recommended)
This method is cleaner and manages configuration for you.

1.  Navigate to your project folder:
    ```bash
    cd /opt/photo-frame
    ```

2.  Start the application:
    ```bash
    # This builds the image and starts the container in the background
    docker-compose up -d
    ```

3.  Useful commands:
    ```bash
    # View logs
    docker-compose logs -f
    
    # Restart (rebuilds if you changed code)
    docker-compose down
    docker-compose up -d --build
    ```

### Option B: Manual Docker Command
If you prefer running manual commands or don't have docker-compose.

1.  Build the image:
    ```bash
    docker build -t photo-frame .
    ```

2.  Run the container:
    ```bash
    docker run -d \
      --name digital_frame \
      --restart unless-stopped \
      -p 8090:8090 \
      -v ./pb_data:/pb/pb_data \
      photo-frame
    ```

## 3. Verify
Open `http://YOUR_VPS_IP:8090` in your browser. You should see the login screen.

## 4. Default Nginx Proxy Manager Configuration
This section assumes you already have Nginx Proxy Manager (NPM) installed and running on port 81.

### Step-by-Step Configuration

1.  **Log In** to your NPM dashboard (usually `http://YOUR_VPS_IP:81`).
2.  Click **Hosts** -> **Proxy Hosts** -> **Add Proxy Host**.

#### Tab 1: Details
*   **Domain Names**: Enter your domain (e.g., `frame.example.com`). Press Enter.
*   **Scheme**: `http` (PocketBase runs on HTTP inside the container).
*   **Forward Hostname / IP**:
    *   *Option A (Public IP)*: Enter your VPS Public IP.
    *   *Option B (Docker Internal)*: Enter `172.17.0.1` (The default Docker host gateway).
*   **Forward Port**: `8090`.
*   **Cache Assets**: Disabled (Recommended for React apps to avoid stale updates).
*   **Block Common Exploits**: **Enabled**.
*   **Websockets Support**: **ENABLED** (CRITICAL: PocketBase uses websockets for real-time updates).

#### Tab 2: Custom Locations
*   (Skip this tab)

#### Tab 3: SSL
*   **SSL Certificate**: Select "Request a new SSL Certificate".
*   **Force SSL**: **Enabled** (Redirects HTTP to HTTPS).
*   **HTTP/2 Support**: **Enabled**.
*   **HSTS Enabled**: **Enabled** (Security best practice).
*   **Email Address for Let's Encrypt**: Enter your email.
*   **I Agree to the Terms of Service**: Check this.

### Finalize
Click **Save**.
*   It may take 10-20 seconds to generate the SSL certificate.
*   Once done, try accessing `https://frame.example.com`.

Current status:s
files at /projects/photo-frame
docker image built. Called photo-frame
what port does this work on? what port is exposed and linked. 
need to create a docker compose file
need to set up nginx proxy manager
remember your need the network stuff in the compose file

----

Copy the new copy access
Do a docker-compose up -d
docker-compose up -d build
