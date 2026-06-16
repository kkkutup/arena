import { GOOGLE_WEB_CLIENT_ID } from './auth-config';

let configured = false;

// Lazy-loads the native module so the auth screen still renders in Expo Go
// (where the native Google module is absent). Real sign-in requires a dev build.
export async function signInWithGoogle(): Promise<string | null> {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  if (!configured) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
    configured = true;
  }
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  const data = (res as { type?: string; data?: { idToken?: string | null } }).data;
  return data?.idToken ?? null;
}
