// Backend (NestJS) on the Hetzner box, fronted by Caddy with auto-HTTPS.
// Swap to a custom domain later by changing this one value.
export const API_BASE_URL = 'https://95-216-202-119.sslip.io';

// Connectivity check against the live backend (this endpoint exists today).
// The full httpClient is built alongside backend B1–B4; until then the app uses
// the mock client (see ./index.ts).
export async function backendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health/live`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
