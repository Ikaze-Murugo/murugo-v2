/**
 * Push notifications via Firebase Cloud Messaging (FCM).
 * If Firebase is not configured (missing env), all methods no-op.
 */

let admin: typeof import('firebase-admin') | null = null;

function getAdmin(): typeof import('firebase-admin') | null {
  if (admin !== null) return admin;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (!projectId || !privateKey || !clientEmail) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const firebaseAdmin = require('firebase-admin');
    if (!firebaseAdmin.apps?.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });
    }
    admin = firebaseAdmin;
    return admin;
  } catch {
    return null;
  }
}

export interface SendPushOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushToToken(options: SendPushOptions): Promise<boolean> {
  const firebase = getAdmin();
  if (!firebase) return false;
  try {
    await firebase.messaging().send({
      token: options.token,
      notification: {
        title: options.title,
        body: options.body,
      },
      data: options.data ?? {},
      android: {
        priority: 'high',
      },
    });
    return true;
  } catch (err) {
    console.warn('FCM send failed:', err);
    return false;
  }
}

export async function sendPushToTokens(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void> {
  const firebase = getAdmin();
  if (!firebase || tokens.length === 0) return;
  const promises = tokens.map((token) =>
    sendPushToToken({ token, title, body, data })
  );
  await Promise.all(promises);
}
