# Download page — APK via EAS (Option A)

The site does **not** host the APK in this repo. The download page links directly to the **EAS build artifact URL**.

## When you release a new build

1. From `mobile/`, run:  
   `eas build --platform android --profile preview` (or `production`).
2. After the build finishes, copy the **artifact URL** from the EAS output or dashboard, e.g.:  
   `https://expo.dev/artifacts/eas/XXXXXXXX.apk`
3. In `web/app/download/page.tsx`, update the `APK_URL` constant with this new URL.
4. Commit and deploy the web app. No APK file is committed to Git.

This keeps the repo small and avoids GitHub file size limits.
