# 🔥 Firebase Setup Guide for MMG Properties Platform

## Quick Fix for Authentication Error

The `auth/invalid-credential` error occurs because the Firebase project isn't fully configured yet. Here's how to fix it:

### Option 1: Use Firebase Emulator (Recommended for Development)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Start emulators
npm run emulator:start

# In another terminal, set emulator mode and start dev server
USE_FIREBASE_EMULATOR=true npm run dev
```

### Option 2: Create Production Firebase Project

1. **Go to Firebase Console:** https://console.firebase.google.com
2. **Create new project:** `mmg-properties-africa`
3. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. **Enable Firestore Database:**
   - Go to Firestore Database
   - Create database in production mode
5. **Get your config:**
   - Go to Project Settings > General
   - Add web app
   - Copy the Firebase config

### Option 3: Quick Setup Script (Easiest)

```bash
# Run the Firebase setup script
npm run setup:firebase

# This will:
# 1. Test Firebase connection
# 2. Create all test users
# 3. Verify credentials work
```

## Current Configuration Issue

Your current Firebase config is using a placeholder API key:
```
AIzaSyD-w4tP94wfkorfa0vgKFd4kVYU-qDqe48
```

This needs to be replaced with your actual Firebase project credentials.

## Environment Variables Setup

Create `.env.local` file with your actual Firebase credentials:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mmg-properties-africa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mmg-properties-africa
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mmg-properties-africa.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# For development with emulator
USE_FIREBASE_EMULATOR=true
```

## Test User Credentials

Once Firebase is properly configured, you can login with:

### Admin
- **Email:** admin@mmgproperties.africa
- **Password:** Admin@MMG2024!

### Owner  
- **Email:** owner@example.com
- **Password:** Owner@123456

### Agent
- **Email:** agent@mmgproperties.africa  
- **Password:** Agent@123456

### Tenant
- **Email:** tenant@example.com
- **Password:** Tenant@123456

## Troubleshooting Common Issues

### 1. `auth/invalid-credential`
- Firebase project doesn't exist
- Wrong API key in environment variables
- Authentication not enabled in Firebase Console

### 2. `auth/network-request-failed`
- Internet connection issue
- Firebase servers unreachable
- Firewall blocking Firebase

### 3. `auth/project-not-found`
- Project ID doesn't match actual Firebase project
- Typo in project configuration

### 4. `auth/api-key-not-valid`
- API key is wrong or disabled
- API key restrictions preventing access

## Development vs Production

### Development (Recommended)
```bash
# Use Firebase emulator
USE_FIREBASE_EMULATOR=true npm run dev
```

### Production
```bash
# Use real Firebase project
npm run dev
```

## Firebase Console URLs

- **Project Overview:** https://console.firebase.google.com/project/mmg-properties-africa
- **Authentication:** https://console.firebase.google.com/project/mmg-properties-africa/authentication/users
- **Firestore:** https://console.firebase.google.com/project/mmg-properties-africa/firestore/data

## Next Steps

1. Choose Option 1, 2, or 3 above
2. Update your `.env.local` with correct credentials
3. Run `npm run setup:firebase` to create test users
4. Start development server: `npm run dev`
5. Login with test credentials

## Need Help?

If you continue having issues:

1. Check Firebase Console for your project status
2. Verify all services (Auth, Firestore) are enabled
3. Double-check your API keys match the console
4. Try using the emulator for development first