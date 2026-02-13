# 🔥 Firebase Setup Guide

This guide will help you configure Firebase for the M'Martin project.

## Prerequisites

- A Google account
- Basic understanding of environment variables

## Step-by-Step Firebase Configuration

### 1. Create a Firebase Project (if you haven't already)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** (or select existing project `m-martin-estofados`)
3. Follow the wizard to create your project

### 2. Get Your Firebase Credentials

1. In the Firebase Console, select your project
2. Click the **⚙️ gear icon** next to "Project Overview" → **Project settings**
3. Scroll down to the **Your apps** section
4. If you don't have a web app yet:
   - Click the **</>** (web) icon to add a web app
   - Give it a nickname (e.g., "M'Martin Web")
   - Click **Register app**
5. You'll see a `firebaseConfig` object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 3. Configure Your Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Replace the placeholder values with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # Copy from firebaseConfig.apiKey
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456  # Copy from firebaseConfig.appId
   VITE_ADMIN_USER=admin
   VITE_ADMIN_PASS=your_strong_password_here
   VITE_WHATSAPP_NUMBER=5500000000000
   ```

4. Save the file

### 4. Restart Development Server

After creating/editing `.env`, you **must** restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

### 5. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Select **Email/Password** as a sign-in method
4. Enable it and click **Save**

### 6. Create Admin User

1. Still in **Authentication**, go to the **Users** tab
2. Click **Add user**
3. Enter:
   - Email: `admin@mmartin.com` (or your preferred email)
   - Password: Choose a strong password
4. Click **Add user**

### 7. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll deploy custom rules)
4. Choose a location close to your users
5. Click **Enable**

### 8. Deploy Security Rules

Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

## Verification

After completing the setup:

1. Start the development server: `npm run dev`
2. Open the browser console (F12)
3. You should NOT see any Firebase errors
4. Navigate to `/login`
5. Try logging in with your admin credentials
6. You should be redirected to the admin dashboard

## Common Issues

### "auth/api-key-not-valid"
- Make sure you copied the correct `apiKey` from Firebase Console
- Ensure there are no extra spaces or quotes
- Restart the dev server after editing `.env`

### "YOUR_API_KEY" appears in console errors
- You forgot to create the `.env` file
- Follow Step 3 above

### Environment variables not loading
- Make sure your `.env` file is in the project root directory
- Variable names must start with `VITE_` for Vite to include them
- Restart the dev server after any `.env` changes

## Security Notes

⚠️ **IMPORTANT**:
- Never commit your `.env` file to Git (it's in `.gitignore`)
- Never share your Firebase credentials publicly
- Use different Firebase projects for development and production
- In production, use Firebase Security Rules to protect your data

## Next Steps

Once Firebase is configured:
- Read [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for security implementation details
- Check [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for technical documentation
- Review [firestore.rules](firestore.rules) to understand data access rules

---

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs) or open an issue in the repository.
