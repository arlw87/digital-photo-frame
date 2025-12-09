import urllib.request
import urllib.parse
import json
import os
from PIL import Image, ImageDraw

# Config
PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@local.host"
ADMIN_PASS = "password123"
USER_EMAIL = "display@frame.local"
USER_PASS = "testPassword123"

def create_image(filename, color, size=(500, 1000)):
    if not os.path.exists(filename):
        img = Image.new('RGB', size, color=color)
        d = ImageDraw.Draw(img)
        d.text((10, 10), filename, fill="white")
        img.save(filename)
    return filename

def req(url, method="GET", data=None, headers=None, files=None):
    if headers is None: headers = {}
    
    if files:
        # Simple multipart for a single file (not robust but okay for known inputs)
        boundary = 'wL36Yn8afVp8Ag7AmP8qZ0SA4n1v9T'
        headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
        body = []
        # Add data fields
        if data:
            for k, v in data.items():
                body.append(f'--{boundary}'.encode())
                body.append(f'Content-Disposition: form-data; name="{k}"'.encode())
                body.append(b'')
                body.append(str(v).encode())
        # Add file
        for k, v in files.items():
            with open(v, 'rb') as f:
                content = f.read()
            body.append(f'--{boundary}'.encode())
            body.append(f'Content-Disposition: form-data; name="{k}"; filename="{v}"'.encode())
            body.append(b'Content-Type: application/octet-stream')
            body.append(b'')
            body.append(content)
        body.append(f'--{boundary}--'.encode())
        body.append(b'')
        data_bytes = b'\r\n'.join(body)
        
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    else:
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        else:
            data_bytes = None
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as r:
            code = r.getcode()
            resp = r.read().decode('utf-8')
            if code == 204 or not resp:
                return code, {}
            return code, json.loads(resp)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def run():
    # 1. Auth Admin
    print("Authenticating admin...")
    # PocketBase v0.23+ uses _superusers collection for admins
    code, resp = req(f"{PB_URL}/api/collections/_superusers/auth-with-password", "POST", {
        "identity": ADMIN_EMAIL,
        "password": ADMIN_PASS
    })
    if code != 200:
        print("Admin auth failed:", resp)
        return
    token = resp["token"]
    headers = {"Authorization": token}

    # 2. Check Schema (Images must have 'owner')
    print("Checking schema...")
    code, collections = req(f"{PB_URL}/api/collections", "GET", headers=headers)
    img_col = next((c for c in collections["items"] if c["name"] == "images"), None)
    if not img_col:
        print("Images collection not found!")
        return
    
    print("Found fields:", [f["name"] for f in img_col["fields"]])
    has_owner = any(f["name"] == "owner" for f in img_col["fields"])
    if not has_owner:
        print("Schema missing 'owner' field. Please add migration.")
        # We can try to add it dynamically?
        # Better to fail and let Agent fix it via migration tool properly.
        return 

    # 3. Create/Get User
    user_id = ""
    code, resp = req(f"{PB_URL}/api/collections/users/records?filter=" + urllib.parse.quote(f'email="{USER_EMAIL}"'), "GET", headers=headers)
    if resp["totalItems"] > 0:
        print("User exists")
        user_id = resp["items"][0]["id"]
    else:
        print("Creating user...")
        code, resp = req(f"{PB_URL}/api/collections/users/records", "POST", {
            "email": USER_EMAIL,
            "password": USER_PASS,
            "passwordConfirm": USER_PASS,
            "slideshow_portrait_pair": True,
            "slideshow_order": "newest"
        }, headers=headers)
        if code != 200:
            print("Create user failed:", resp)
            return
        user_id = resp["id"]

    print(f"User ID: {user_id}")
    
    # 3.5 Cleanup existing images for user
    print("Cleaning up old images...")
    code, resp = req(f"{PB_URL}/api/collections/images/records?filter=owner='{user_id}'", "GET", headers=headers)
    if code == 200:
        for item in resp["items"]:
            req(f"{PB_URL}/api/collections/images/records/{item['id']}", "DELETE", headers=headers)

    # 4. Create Images
    p1 = create_image("portrait_old.png", "blue", (500, 1000))
    l1 = create_image("landscape_mid.png", "red", (1000, 500))
    p2 = create_image("portrait_new.png", "green", (500, 1000))

    # 5. Upload Images in specific order (for 'newest' sort)
    # We want final order: P2 (New), L1 (Mid), P1 (Old)
    # So P2 should pair with P1, skipping L1.
    
    # Upload P1 first (Oldest)
    print(f"Uploading {p1}...")
    files = {'file': p1}
    data = {'owner': user_id, 'name': p1}
    req(f"{PB_URL}/api/collections/images/records", "POST", data=data, files=files, headers=headers)
    
    # Upload L1 (Mid)
    print(f"Uploading {l1}...")
    files = {'file': l1}
    data = {'owner': user_id, 'name': l1}
    req(f"{PB_URL}/api/collections/images/records", "POST", data=data, files=files, headers=headers)

    # Upload P2 (Newest)
    print(f"Uploading {p2}...")
    files = {'file': p2}
    data = {'owner': user_id, 'name': p2}
    req(f"{PB_URL}/api/collections/images/records", "POST", data=data, files=files, headers=headers)

    print("Done")

if __name__ == "__main__":
    run()
