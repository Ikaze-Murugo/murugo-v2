import { Router, Request, Response } from 'express';
import { successResponse } from '../utils/response.util';

const router = Router();

/**
 * Public app config for update check (mobile).
 * Returns latest Android version and download URL so the app can show "update available" and link to the APK.
 */
router.get('/config', (_req: Request, res: Response) => {
  const version = process.env.APP_ANDROID_VERSION || '1.0.0';
  const downloadUrl =
    process.env.APP_ANDROID_DOWNLOAD_URL || 'https://murugohomes.com/download/murugohomes.apk';
  const minVersion = process.env.APP_ANDROID_MIN_VERSION || '1.0.0';

  successResponse(
    res,
    {
      android: {
        version,
        downloadUrl,
        minVersion,
      },
    },
    'App config fetched'
  );
});

export default router;
