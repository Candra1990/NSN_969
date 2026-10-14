import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured, otherwise fall back to the project default database
const dbId = (firebaseConfig as any).firestoreDatabaseId;
console.log(`[Firebase Init] Initializing Firestore with Database ID: ${dbId || '(default)'}`);
export const db = dbId 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, dbId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

// Initialize Auth
export const auth = getAuth(app);

// Setup Google Sign In Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Cache the Gmail access token in memory
let cachedGmailAccessToken: string | null = null;

// Authentication handlers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const loginWithGmail = async () => {
  try {
    const gmailProvider = new GoogleAuthProvider();
    gmailProvider.setCustomParameters({
      prompt: 'select_account'
    });
    // Add essential requested Gmail scopes
    gmailProvider.addScope('https://mail.google.com/');
    gmailProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    gmailProvider.addScope('https://www.googleapis.com/auth/gmail.send');
    gmailProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
    gmailProvider.addScope('https://www.googleapis.com/auth/gmail.modify');

    const result = await signInWithPopup(auth, gmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedGmailAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: credential?.accessToken || null };
  } catch (error) {
    console.error('Gmail Sign-In Error:', error);
    throw error;
  }
};

export const getGmailToken = () => cachedGmailAccessToken;

export const logoutUser = async () => {
  try {
    await signOut(auth);
    cachedGmailAccessToken = null;
  } catch (error) {
    console.error('Sign-Out Error:', error);
    throw error;
  }
};

// Firestore Error Handling System
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  // Logged gracefully to console to prevent fatal app crash (Script error) during transient network/setup failures.
}
