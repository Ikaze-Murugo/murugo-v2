# Android APK hosting

Place your built Android APK here so it can be downloaded from the website.

**File to add:** `murugohomes.apk`

- Build the APK with EAS: from `mobile/` run  
  `eas build --platform android --profile production` (or `preview`).
- Download the `.apk` from the EAS build page.
- Rename it to `murugohomes.apk` and put it in this folder:  
  `web/public/download/murugohomes.apk`

The download page will then serve it at:

**https://your-domain.com/download/murugohomes.apk**

Do not commit large binaries if your repo has size limits; consider using Git LFS or uploading the APK to the server after deploy and syncing it into this path.
