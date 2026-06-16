// Google OAuth — paste your "Web application" client ID here.
// (Google Cloud Console → Credentials → OAuth client → Web application.)
// It looks like: 1234567890-abcdef.apps.googleusercontent.com
// The backend's GOOGLE_CLIENT_ID env must be set to this same value.
export const GOOGLE_WEB_CLIENT_ID = 'PASTE_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

export const googleConfigured = !GOOGLE_WEB_CLIENT_ID.startsWith('PASTE_');
