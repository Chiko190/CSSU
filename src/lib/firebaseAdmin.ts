import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. In the Firebase console, go to " +
        "Project settings > Service accounts > Generate new private key, then set the " +
        "downloaded JSON file's contents as this environment variable.",
    );
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }
}

function getAdminApp(): App {
  return getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
