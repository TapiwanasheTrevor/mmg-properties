# Firebase Setup Guide for MMG Platform

This guide will help you set up Firebase Authentication and Firestore database for the MMG Platform.

## Prerequisites

- A Google account
- Node.js installed on your system
- Firebase CLI installed globally: `npm install -g firebase-tools`

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `mmg-platform` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following sign-in providers:
   - **Email/Password**: Enable this provider
   - **Google**: Enable and configure OAuth consent screen
   - **Phone**: Enable for SMS verification (optional)

3. Go to **Authentication** > **Settings** > **Authorized domains**
4. Add your domains:
   - `localhost` (for development)
   - Your production domain

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the Firebase Console
2. Click "Create database"
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location (choose one close to your users)
5. Click "Done"

## Step 4: Set up Firebase Storage

1. Go to **Storage** in the Firebase Console
2. Click "Get started"
3. Choose **Start in test mode**
4. Select the same location as your Firestore database
5. Click "Done"

## Step 5: Get Firebase Configuration

1. Go to **Project Overview** > **Project settings**
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app with name "MMG Platform Web"
5. Copy the Firebase configuration object

## Step 6: Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## Step 7: Deploy Security Rules

1. Install Firebase CLI and login:
```bash
npm install -g firebase-tools
firebase login
```

2. Initialize Firebase in your project:
```bash
firebase init
```
Select:
- Firestore: Configure security rules and indexes
- Storage: Configure security rules
- Choose your Firebase project

3. Replace the generated rules with our custom rules:
   - Copy `firestore.rules` to `firestore.rules`
   - Copy `storage.rules` to `storage.rules`

4. Deploy the rules:
```bash
firebase deploy --only firestore:rules,storage
```

## Step 8: Set up Firestore Indexes (Optional)

For better query performance, you may need to create indexes. The Firebase Console will show you which indexes to create when you run queries.

Common indexes needed:
- `users` collection: `role`, `isActive`, `createdAt`
- `properties` collection: `ownerId`, `agentId`, `status`, `createdAt`
- `maintenance_requests` collection: `status`, `priority`, `tenantId`, `propertyId`, `createdAt`

## Step 9: Set up Firebase Functions (Optional)

If you want to use Firebase Functions for backend logic:

1. Initialize Functions:
```bash
firebase init functions
```

2. Choose TypeScript/JavaScript
3. Install dependencies when prompted

## Step 10: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Go to `http://localhost:3000`
3. Try to register a new user
4. Check the Firebase Console to see if the user was created

## Firebase Emulators (Development)

For local development, you can use Firebase emulators:

1. Install emulators:
```bash
firebase init emulators
```
Select: Authentication, Firestore, Storage

2. Start emulators:
```bash
firebase emulators:start
```

3. The app will automatically connect to emulators in development mode.

## User Roles and Permissions

The platform supports 4 user roles:

### Admin
- Full access to all features
- Can manage users, properties, leases, maintenance
- Can view all reports and analytics

### Owner
- Can manage their properties and units
- Can view leases and tenants for their properties
- Can approve maintenance requests
- Can view financial reports for their properties

### Agent
- Can manage assigned properties
- Can create and manage leases
- Can handle maintenance requests
- Limited financial access

### Tenant
- Can view their lease information
- Can submit maintenance requests
- Can view payment history
- Limited read-only access

## Security Features

- Multi-factor authentication (MFA) support
- Role-based access control (RBAC)
- Comprehensive Firestore security rules
- File upload restrictions and validation
- Audit logging for sensitive operations

## Troubleshooting

### Common Issues:

1. **"Firebase is not properly configured"**
   - Check your `.env.local` file
   - Ensure all environment variables are set correctly

2. **Permission denied errors**
   - Check Firestore security rules
   - Ensure user has the correct role assigned

3. **Authentication not working**
   - Check if authentication providers are enabled
   - Verify authorized domains include your current domain

4. **File uploads failing**
   - Check Storage security rules
   - Verify file size and type restrictions

### Getting Help:

- Check the browser console for detailed error messages
- Review Firebase Console logs
- Check the `isFirebaseConfigured()` function output
- Ensure your Firebase project has billing enabled for production use

## Production Deployment

Before deploying to production:

1. **Update security rules** to be more restrictive
2. **Enable billing** on your Firebase project
3. **Set up monitoring** and alerts
4. **Configure backup** for Firestore
5. **Set up proper error logging**
6. **Review and test all security rules**

## Cost Optimization

- Use Firestore queries efficiently
- Implement proper pagination
- Use Firebase Storage compression
- Monitor usage in Firebase Console
- Set up billing alerts

This setup provides a robust, scalable backend for your property management platform with proper security and authentication.