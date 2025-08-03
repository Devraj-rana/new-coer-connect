# 🔥 Firebase Deployment Guide for CoerConnect

## Prerequisites

1. **Firebase CLI Installation**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore Database, and Storage
   - Set up authentication providers (Google, Email/Password)

## 🚀 Deployment Steps

### 1. Firebase Project Initialization

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project directory
firebase init

# Select the following services:
# ✅ Firestore: Configure security rules and indexes files
# ✅ Hosting: Configure files for Firebase Hosting
# ✅ Storage: Configure a security rules file for Cloud Storage

# When prompted:
# - Use an existing project: Select your Firebase project
# - Firestore rules file: firestore.rules
# - Firestore indexes file: firestore.indexes.json
# - Storage rules file: storage.rules
# - Public directory: out (for Next.js static export)
```

### 2. Environment Variables Setup

Create `.env.local` file with your Firebase configuration:

```bash
# Copy from .env.example and fill in your Firebase config
cp .env.example .env.local
```

**Get Firebase Config:**
1. Go to Firebase Console → Project Settings → General
2. Scroll down to "Your apps" and click the web app
3. Copy the config values

### 3. Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Export static files (if using static hosting)
npm run export

# Deploy to Firebase
firebase deploy
```

## 🔧 Firebase Services Configuration

### Authentication Setup

1. **Enable Authentication:**
   ```
   Firebase Console → Authentication → Sign-in method
   ```

2. **Enable Providers:**
   - Email/Password ✅
   - Google ✅
   - Add authorized domains for production

### Firestore Database

1. **Create Database:**
   ```
   Firebase Console → Firestore Database → Create database
   Choose "Start in production mode"
   ```

2. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Storage Setup

1. **Enable Storage:**
   ```
   Firebase Console → Storage → Get started
   ```

2. **Deploy Storage Rules:**
   ```bash
   firebase deploy --only storage
   ```

### Hosting Configuration

1. **Build Configuration in `next.config.mjs`:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   };
   
   export default nextConfig;
   ```

2. **Add Build Scripts to `package.json`:**
   ```json
   {
     "scripts": {
       "build": "next build",
       "export": "next export",
       "deploy": "npm run build && npm run export && firebase deploy"
     }
   }
   ```

## 🌐 Production Environment Variables

Set these in Firebase Hosting environment config:

```bash
# For Firebase Functions (if using)
firebase functions:config:set \
  app.url="https://your-app.web.app" \
  mongodb.uri="your-mongodb-uri"

# For Next.js build (set in .env.local)
NEXT_PUBLIC_APP_URL=https://your-app.web.app
```

## 📱 PWA Configuration (Optional)

Add PWA capabilities with `next-pwa`:

```bash
npm install next-pwa
```

Update `next.config.mjs`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
});
```

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use Firebase environment config for sensitive data

2. **Firestore Rules:**
   - Test rules thoroughly before production
   - Use Firebase Rules Playground for testing

3. **Authentication:**
   - Enable app verification for phone auth
   - Set up proper password requirements
   - Configure authorized domains

## 🚀 Quick Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash
echo "🔥 Deploying CoerConnect to Firebase..."

# Build the application
npm run build

# Export static files
npm run export

# Deploy to Firebase
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://your-app.web.app"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📊 Post-Deployment Checklist

- [ ] Test authentication flows
- [ ] Verify quiz creation and taking
- [ ] Check Firestore data structure
- [ ] Test file uploads to Storage
- [ ] Verify responsive design
- [ ] Check performance with Lighthouse
- [ ] Set up monitoring and analytics

## 🔍 Monitoring & Analytics

1. **Firebase Analytics:**
   ```javascript
   // Already configured in lib/firebase/config.ts
   import { analytics } from '@/lib/firebase/config';
   ```

2. **Performance Monitoring:**
   ```bash
   # Add to Firebase initialization
   firebase init performance
   ```

3. **Crashlytics (for mobile apps):**
   ```bash
   firebase init crashlytics
   ```

## 🆘 Troubleshooting

### Common Issues:

1. **Build Errors:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Firebase Rules Issues:**
   ```bash
   # Test rules locally
   firebase emulators:start --only firestore
   ```

3. **Environment Variables:**
   ```bash
   # Check if variables are loaded
   console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
   ```

### Useful Commands:

```bash
# Check Firebase project status
firebase projects:list

# View current deployments
firebase hosting:sites:list

# Rollback deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID

# View logs
firebase functions:log

# Run local emulators
firebase emulators:start
```

---

**Need Help?** 
- 📖 [Firebase Documentation](https://firebase.google.com/docs)
- 🔧 [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- 💬 [Firebase Community](https://firebase.google.com/community)
