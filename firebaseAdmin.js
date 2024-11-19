import admin from 'firebase-admin';
import serviceAccount from "C:/Users/Lavina37/Downloads/folaringtest-firebase-adminsdk-y6671-1f3b749ecd.json"; // เปลี่ยนเป็น path ที่ถูกต้อง

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
