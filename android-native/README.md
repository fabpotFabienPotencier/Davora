# Davora Native Android App

A fully native Android client for Davora — Kotlin + XML, no WebView.
Same black design as the web app, talking directly to the Davora backend
(`api.davora.xyz`) and Groq-powered streaming over WebSocket.

## Features

- Email/password login & signup
- Google Sign-In (Credential Manager)
- Real-time AI chat with streaming responses (WebSocket)
- Markdown rendering (bold, code blocks, lists) in AI messages
- AI-generated image display
- Voice input (SpeechRecognizer)
- Text-to-speech playback (long-press any AI message → Listen)
- Chat history sidebar (sessions synced with backend)
- Subscriptions via Google Play Billing (Basic / Pro / Premium)
- Push notifications (Firebase Cloud Messaging)
- Encrypted on-device token storage

## Requirements

- Android Studio Hedgehog or newer
- minSdk 24 / targetSdk 35
- JDK 17

## Build

```bash
cd android-native
gradle assembleDebug      # debug APK
gradle bundleRelease      # release AAB for Play Store
```

## CI

Add `.github/workflows/build-native-android.yml` (see chat / docs) to build
and sign automatically. It reuses the existing repo secrets:
`ANDROID_SIGNING_KEY`, `ANDROID_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_PASSWORD`.

## Play Console setup needed

1. Create subscription products: `davora_basic`, `davora_pro`, `davora_premium`
2. Add your Android SHA-1/SHA-256 to Firebase for Google Sign-In
3. Enable FCM in Firebase console (google-services.json already included)
