import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

const isConfigValid = !!firebaseConfig.apiKey && 
                     !firebaseConfig.apiKey.startsWith('TODO');

try {
  if (isConfigValid) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
    auth = getAuth(app);
  } else {
    console.warn('Firebase configuration is missing or invalid. Please set up Firebase.');
  }
} catch (e) {
  console.error('Firebase initialization failed:', e);
}

export { db, auth, app };
