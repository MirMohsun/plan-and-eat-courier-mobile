# Build secrets (local only)

Do not commit real credentials. Share this folder as an encrypted archive with trusted teammates.

## Expected layout

```text
secrets/
  .env
  android/
    keystore.properties
    planandeat-courier-release.keystore
  ios/
    # see ios/README.md — add .p12 / .mobileprovision manually
```

## Setup after cloning

1. Unpack the secrets archive into the repository root so paths match the layout above.
2. Copy `android/keystore.properties.example` to `secrets/android/keystore.properties` if you only received the keystore file, then fill in passwords.
3. Install dependencies: `pnpm install`

## Env file

`secrets/.env` is loaded by Metro and `app.config.ts` via `scripts/load-secrets-env.js`.

Minimum keys used by this project:

```bash
EXPO_PUBLIC_API_URL_DEVELOPMENT=
EXPO_PUBLIC_API_URL_PRODUCTION=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=
```

## Android release builds

Release signing reads `secrets/android/keystore.properties` (see `android/app/build.gradle`).

```bash
pnpm bundleRelease
pnpm assembleRelease
```

## iOS

Firebase and bundle id live in Git. Distribution certificate and provisioning profile do not — see `secrets/ios/README.md`.
