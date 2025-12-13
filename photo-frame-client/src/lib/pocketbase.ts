import PocketBase from 'pocketbase';

// Use relative URL so it works in both dev (with proxy) and prod (same origin)
export const pb = new PocketBase('/');
