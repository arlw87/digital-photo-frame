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
SSH into your VPS and run:
```bash
cd /opt/photo-frame

# Build the image directly on the VPS
docker build -t photo-frame .

# Run it
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
