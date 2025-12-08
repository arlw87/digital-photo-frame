# Digital Photo Frame

A beautiful, multi-user digital photo frame application with admin interface and public slideshow display.

## Features

- 🖼️ **Multi-User Support** - Each user manages their own photo collection
- 📤 **Easy Upload** - Drag-and-drop interface with HEIC conversion
- 🎨 **Beautiful UI** - Glassmorphism design with dark mode
- 🔐 **Secure Authentication** - Protected admin routes with Magic URL display access
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🎞️ **Slideshow** - Auto-play full-screen slideshow with fade transitions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PocketBase

Download and run PocketBase (http://127.0.0.1:8090):

```bash
./pocketbase serve
```

### 3. Configure PocketBase Collections

#### Create `images` Collection
1. Go to PocketBase Admin UI
2. Create new collection named `images`
3. Add fields:
   - `name` (Text)
   - `file` (File - single, max size 10MB)
   - `tags` (Text)
4. API Rules (for multi-user):
   - List/Search: `@request.auth.id != ""`
   - View: `@request.auth.id != ""`
   - Create: `@request.auth.id != ""`
   - Update: `id = @request.auth.id`
   - Delete: `id = @request.auth.id`

#### Configure `users` Collection

**CRITICAL: Authentication Rule**

The `users` collection requires special configuration to allow regular user login:

1. Go to Collections → **users**
2. Click the **Settings** (gear icon) tab
3. Scroll to **"Additional auth collection rules"**
4. Find **"Authentication rule"**
5. **Make sure it's EMPTY** (delete "Set Superusers only" if present)
6. Leave it blank to allow anyone with valid credentials to authenticate
7. Click **Save changes**

> ⚠️ **Important**: If the Authentication rule is set to "Set Superusers only", regular users will get a 403 Forbidden error when trying to log in, even with correct credentials.

#### Enable Email/Password Auth
1. In users collection Settings, under **Auth Options**
2. Ensure **"Identity/Password"** is **Enabled**
3. Unique identity field: **email**

#### Add User Settings Fields
1. In `users` collection, add these fields:
   - `slideshow_interval` (Number)
   - `slideshow_fit` (Select: `cover`, `contain`)
   - `slideshow_order` (Select: `newest`, `oldest`, `random`, `random_daily`, `random_hourly`)
2. **API Rules**:
   - Update: `id = @request.auth.id` (Allows users to update their own settings)

### 4. Create Users

#### Create Admin User
```bash
./pocketbase serve
# Then go to http://127.0.0.1:8090/_/ and create admin account
```

#### Create Regular Users
1. In PocketBase Admin → Collections → users
2. Click "New record"
3. Fill in:
   - Email: `user@example.com`
   - Password: (set a password)
   - Verified: ✓ (check this)
4. Save

### 5. Start Development Server

```bash
npm run dev
```

## Usage

### Web Interface (Upload & Manage)

1. Visit `http://localhost:5173/login`
2. Log in with your credentials (admin or regular user)
3. Upload photos via `/admin/upload`
4. Manage photos via `/admin/gallery`

### Display Device (Slideshow)

**Magic URL Format:**
```
http://localhost:5173/?email=USER_EMAIL&key=USER_PASSWORD
```

**Example:**
```
http://localhost:5173/?email=user@example.com&key=yourpassword
```

- Automatically authenticates and shows slideshow
- Perfect for Raspberry Pi or dedicated display devices
- Cycles through photos every 30 seconds
- Hover to reveal "Manage Photos" link

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: PocketBase
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM
- **Image Processing**: heic2any (HEIC → JPEG conversion)

## Troubleshooting

### Users Can't Log In (403 Forbidden)
- Check the **Authentication rule** in users collection Settings
- It must be empty (not "Set Superusers only")

### Images Not Loading
- Verify API Rules in `images` collection allow authenticated users
- Check that user is verified

### Magic URL Not Working
- Ensure both `email` and `key` parameters are in the URL
- Verify the user exists and password is correct
