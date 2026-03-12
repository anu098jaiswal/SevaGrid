// src/services/authService.ts

import { auth } from '../config/firebase';

// ── DEV: Email/password auth ──────────────────────────────────────────────────
// Swap for Phone Auth in production (see comment below).

export const signInWithEmail = (email: string, password: string) =>
  auth().signInWithEmailAndPassword(email, password);

export const signUpWithEmail = (email: string, password: string) =>
  auth().createUserWithEmailAndPassword(email, password);

export const signOut = () => auth().signOut();

export const getCurrentUser = () => auth().currentUser;

// ── PRODUCTION: Phone Auth ────────────────────────────────────────────────────
// import { FirebaseAuthTypes } from '@react-native-firebase/auth';
//
// Step 1 — send OTP:
// export const sendOTP = (phoneNumber: string) =>
//   auth().signInWithPhoneNumber(phoneNumber);
//
// Step 2 — confirm OTP (call after user enters code):
// export const confirmOTP = (
//   confirmation: FirebaseAuthTypes.ConfirmationResult,
//   code: string
// ) => confirmation.confirm(code);
//
// Usage in LoginScreen:
//   const confirmation = await sendOTP('+91 98765 43210');
//   const userCredential = await confirmOTP(confirmation, enteredCode);
// ─────────────────────────────────────────────────────────────────────────────
