@echo off
REM 🔥 Firebase Setup Script for CoerConnect (Windows)
echo 🚀 Setting up Firebase for CoerConnect...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Firebase CLI...
    npm install -g firebase-tools
)

REM Login to Firebase
echo 🔐 Logging into Firebase...
firebase login

REM Initialize Firebase project
echo 🏗️ Initializing Firebase project...
echo Please select the following services when prompted:
echo ✅ Firestore: Configure security rules and indexes files
echo ✅ Hosting: Configure files for Firebase Hosting  
echo ✅ Storage: Configure a security rules file for Cloud Storage
echo.
echo Configuration recommendations:
echo - Firestore rules file: firestore.rules
echo - Firestore indexes file: firestore.indexes.json
echo - Storage rules file: storage.rules
echo - Public directory: out
echo.

firebase init

echo.
echo 🎉 Firebase setup complete!
echo.
echo Next steps:
echo 1. Copy .env.example to .env.local
echo 2. Fill in your Firebase configuration in .env.local
echo 3. Run 'npm run deploy' to build and deploy
echo.
echo 📖 See FIREBASE_DEPLOYMENT.md for detailed instructions

pause
