# Community Workers App 🌿

A React Native (Android) app for field and community workers — health, sanitation, education, and more.

---

## Tech Stack

- **React Native 0.73** (TypeScript)
- **Firebase** — Auth + Firestore + Storage (`@react-native-firebase`)
- **React Navigation 6** — native stack
- **react-native-image-picker** — photo upload

---

## Step-by-Step Setup

### 1. Prerequisites
```bash
# Node 18+
node -v

# Java 17 (for Android)
java -version

# Android Studio with SDK 33+ installed
# ANDROID_HOME env var set
```

### 2. Clone & Install
```bash
# Install deps
npm install

# For Gradle to pick up Firebase, link native modules (auto-linked in RN 0.73+)
cd android && ./gradlew clean && cd ..
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (e.g. `community-workers`)
3. Add an **Android app**:
   - Package name: `com.communityworkers`
   - Download `google-services.json`
   - Place it at: `android/app/google-services.json`
4. Enable **Authentication** → Sign-in method → **Email/Password** *(dev)*
   - For production: enable **Phone** instead
5. Enable **Cloud Firestore** → Start in test mode
6. Enable **Storage** → Start in test mode
7. Apply Firestore security rules: copy `firestore.rules` → Firebase Console → Firestore → Rules

### 4. Android build.gradle changes

**`android/build.gradle`** — add inside `dependencies {}`:
```groovy
classpath 'com.google.gms:google-services:4.4.0'
```

**`android/app/build.gradle`** — add at the very bottom:
```groovy
apply plugin: 'com.google.gms.google-services'
```

Also inside `android/app/build.gradle`, ensure `minSdkVersion 21`.

### 5. Run on Android
```bash
# Start Metro bundler
npm start

# In another terminal
npm run android
```

---

## Project Structure

```
src/
├── config/
│   ├── firebase.ts     ← Firebase module exports
│   └── theme.ts        ← Colors, spacing, radii
├── hooks/
│   ├── useAuth.ts      ← Firebase auth state listener
│   └── useTasks.ts     ← Real-time Firestore task listener
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── SplashScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ProfileSetupScreen.tsx
│   ├── TaskListScreen.tsx
│   └── TaskDetailsScreen.tsx
├── services/
│   ├── authService.ts
│   ├── userService.ts
│   └── taskService.ts
└── types/
    └── index.ts
```

---

## Firestore Data Model

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| name | string | |
| phone | string | |
| role | `"worker"` \| `"supervisor"` | |
| workerType | `"health"` \| `"sanitation"` \| `"education"` \| `"other"` | |
| designation | string | e.g. "ASHA Worker" |
| area | string | e.g. "Ward 12, Bengaluru" |
| createdAt | Timestamp | |

### `tasks/{taskId}`
| Field | Type | Notes |
|---|---|---|
| title | string | |
| description | string | |
| assignedToUserId | string | indexed |
| status | `"pending"` \| `"in_progress"` \| `"done"` | |
| area | string | indexed |
| dueDate | Timestamp \| null | |
| photoUrl | string \| null | Firebase Storage URL |
| note | string \| null | Worker's field note |
| createdByUserId | string | |
| createdAt | Timestamp | |
| completedAt | Timestamp \| null | Set when status → done |
| priorityScore | number \| null | **Populated by ML service** |

**Composite indexes to create in Firebase Console:**
- `tasks`: `assignedToUserId` ASC + `createdAt` DESC
- `tasks`: `area` ASC + `status` ASC

---

## Switching to Phone Auth (Production)

In `src/services/authService.ts`, replace email auth with:

```typescript
import auth from '@react-native-firebase/auth';

// Step 1: Send OTP
export const sendOTP = (phoneNumber: string) =>
  auth().signInWithPhoneNumber(phoneNumber);

// Step 2: Verify OTP
export const verifyOTP = (
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  code: string
) => confirmation.confirm(code);
```

In `LoginScreen.tsx`, replace the email/password fields with a phone number input and OTP field.

---

## Future ML Integration

When ready to integrate a FastAPI ML service for task prioritization:

1. Deploy a Firebase Cloud Function (scheduled every few hours)
2. It reads pending tasks from Firestore
3. Sends them to your FastAPI endpoint
4. Writes back `priorityScore` to each task document

The app **already displays `priorityScore`** — it just shows `null` until ML is live.

```
FastAPI ML Service
      ↑
Cloud Function (scheduled)
      ↑ ↓
Firestore (tasks collection)
      ↓
App UI (TaskListScreen + TaskDetailsScreen)
```

---

## Security Rules

See `firestore.rules`. Key rules:
- Workers can only **read** their own assigned tasks
- Workers can only **update** status/note/photo — not reassign
- Only supervisors can **create** tasks

---

## Design Colors

| Token | Hex | Used for |
|---|---|---|
| greenDeep | `#1B4332` | Headers, primary buttons |
| greenLight | `#40916C` | Accents, done status |
| amber | `#F4A533` | CTA buttons, ML score, avatar |
| offWhite | `#F7F4EF` | Screen backgrounds |
| warmGray | `#E8E4DD` | Borders, dividers |
