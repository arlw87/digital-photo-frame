import PocketBase from 'pocketbase';

// In production, this URL will come from an environment variable
// For now, we hardcode it to localhost
export const pb = new PocketBase('http://127.0.0.1:8090');
