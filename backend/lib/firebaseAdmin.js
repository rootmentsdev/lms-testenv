import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

let firebaseApp = null;

try {
  // Option 1: Initialize using environment variables directly (extremely robust, good for Vercel/Heroku/production envs)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('🔥 Firebase Admin SDK initialized successfully via inline environment variables.');
  }
  // Option 2: Initialize using serviceAccount.json file path
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log(`🔥 Firebase Admin SDK initialized successfully via service account file: ${serviceAccountPath}`);
    } else {
      console.warn(`⚠️ FIREBASE_SERVICE_ACCOUNT_PATH set but file not found at: ${serviceAccountPath}`);
    }
  }
  // Option 3: Fallback check for serviceAccount.json in current directory
  else if (fs.existsSync('./serviceAccount.json')) {
    const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount.json', 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('🔥 Firebase Admin SDK initialized successfully via local serviceAccount.json file.');
  } else {
    console.warn('⚠️ Firebase Admin SDK not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_PATH or inline FIREBASE_ env variables.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
}

/**
 * Sends a push notification to a specific FCM device token.
 * Degrades gracefully if Firebase Admin is not initialized.
 * 
 * @param {string} fcmToken - Target device token
 * @param {Object} payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification message body
 * @param {Object} [payload.data] - Key/value pairs of additional custom data strings
 */
export const sendPushNotification = async (fcmToken, { title, body, data = {} }) => {
  if (!admin.apps || admin.apps.length === 0) {
    console.log(`ℹ️ Push notification skip (Firebase not initialized). Title: "${title}", Body: "${body}"`);
    return null;
  }

  if (!fcmToken) {
    console.warn(`⚠️ Cannot send push notification: FCM token is empty. Title: "${title}"`);
    return null;
  }

  try {
    // Normalize data keys to strings as required by FCM messages
    const stringifiedData = {};
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined && data[key] !== null) {
        stringifiedData[key] = String(data[key]);
      }
    }

    const message = {
      notification: { title, body },
      data: stringifiedData,
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Push notification sent successfully to token ${fcmToken.substring(0, 10)}... :`, response);
    return response;
  } catch (error) {
    console.error(`❌ Error sending push notification to token ${fcmToken.substring(0, 10)}... :`, error.message);
    return null;
  }
};

export default admin;
