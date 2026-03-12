// src/config/firebase.ts
//
// ─── SETUP INSTRUCTIONS ───────────────────────────────────────────────────────
//  1. Go to https://console.firebase.google.com
//  2. Create a new project (e.g. "community-workers")
//  3. Add an Android app → package name: com.communityworkers
//  4. Download google-services.json → place it in android/app/google-services.json
//  5. Enable Authentication → Sign-in method → Email/Password (for dev)
//     Later swap to Phone Auth for production.
//  6. Enable Cloud Firestore (start in test mode, then apply security rules)
//  7. Enable Storage
//
// With @react-native-firebase, initialization is automatic via google-services.json
// Just re-export the modules below for clean imports throughout the app.
// ──────────────────────────────────────────────────────────────────────────────

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export { auth, firestore, storage };
