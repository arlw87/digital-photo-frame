import PocketBase from 'pocketbase';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        console.log("1. Authenticating as Admin...");
        await pb.admins.authWithPassword('admin@example.com', '1234567890');
        console.log("✅ Authenticated!");

        console.log("\n2. Uploading 'test.png' to 'photos' collection...");

        // Read the file buffer
        const filePath = path.join(__dirname, 'test.png');
        const fileBuffer = await fs.readFile(filePath);

        // Create a Blob from the buffer (PocketBase SDK expects Blob/File)
        const fileBlob = new Blob([fileBuffer], { type: 'image/png' });

        // Create the record
        const formData = new FormData();
        formData.append('image', fileBlob, 'test.png');
        formData.append('caption', 'My first uploaded photo via code!');
        formData.append('isVisible', 'true');

        const record = await pb.collection('photos').create(formData);
        console.log(`✅ Created record ID: ${record.id}`);

        console.log("\n3. Listing all photos...");
        const resultList = await pb.collection('photos').getList(1, 50);

        console.log(`Found ${resultList.totalItems} photos:`);
        resultList.items.forEach((item) => {
            const imageUrl = pb.files.getURL(item, item.image);
            console.log(`- [${item.id}] ${item.caption} (Image: ${imageUrl})`);
        });

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

main();
