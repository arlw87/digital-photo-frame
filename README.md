# Digital Photo Frame

A digital photo frame application with a React frontend and a PocketBase backend.

## Project Structure

- `photo-frame-client/`: The React frontend application.
- `backend/`: The PocketBase backend server.

## Cloning the Repository

To get started, clone the repository to your local machine:

```bash
git clone https://github.com/arlw87/digital-photo-frame.git
cd digital-photo-frame
```

## Prerequisites

- **Node.js**: Version 18+ (Recommended: use `nvm` to install the latest version).
- **PocketBase**: The executable is expected in the `backend/` directory.

## Setup Instructions

### 1. Client Setup (Frontend)

Navigate to the client directory and install dependencies:

```bash
cd photo-frame-client
npm install
```

To run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### 2. Backend Setup

The backend uses PocketBase.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  If you haven't already, download the PocketBase executable (Linux AMD64) and place it here.

3.  Run the PocketBase server:
    ```bash
    ./pocketbase serve --http=127.0.0.1:8090
    ```

The backend API will be available at [http://127.0.0.1:8090](http://127.0.0.1:8090).
The Admin UI is available at [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/).

## Usage

### 1. Admin Configuration (Backend)

1.  Open the **Admin UI** at [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/).
2.  **Login** with your admin credentials.
3.  **Create a User**:
    - Go to the **users** collection.
    - Click **"New record"**.
    - Fill in the email and password.
    - (Optional) Set the `slideshow_order` preference.

### 2. Client Usage (Frontend)

1.  Ensure both the backend (`./pocketbase serve`) and frontend (`npm run dev`) are running.
2.  Open [http://localhost:5173/login](http://localhost:5173/login).
3.  Log in with the credentials of the user you created in step 3 above.
4.  Upload images and update settings from there

### 3. Direct Link (Kiosk Mode)

To view the slideshow without a manual login screen (e.g., for a dedicated display), use the following URL format:

```
http://localhost:5173/?email=display@frame.local&key=testPassword123
```

- Replace `display@frame.local` with the user's email.
- Replace `testPassword123` with the user's password.


