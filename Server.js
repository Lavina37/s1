import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { initializeApp } from 'firebase/app'; // ใช้ import สำหรับ Firebase
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // ใช้ Firebase Auth
import admin from 'firebase-admin';

import dotenv from 'dotenv'; // ใช้ dotenv ในการโหลด environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});


app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});
app.use(express.json());

// ตั้งค่า Firebase Client SDK
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
};

initializeApp(firebaseConfig); // Initialize Firebase

// Initialize Firebase Admin SDK
const serviceAccount = ({
  "type": "service_account",
  "project_id": "folaringtest",
  "private_key_id": "1f3b749ecda713ab62880acb52b87f798b4c989f",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCbeGRh6ueFnNAq\nXWeOkk6KHEpmqenz0ar5tkim41XOeoPaYocy7isXIZhNCUUIgZxylynsdUsjhXnL\n4gwsXsZtzceRgZI2PM5+NtrKTZW/Lkdod6KTdsTKIdWziO7RN6NTFCnQAxcMH2qW\nkwTXSjGUbZvCcv9Wk5V63EwKGnczOHZQtmCx489x7AxOO/7xHeo18+B5dZlaqbTb\nYrt/g2D0JS+ksV33LGCoKtrzBTJ7cjCOZl74JLriaq1OUScs/pqpGAaJBxN9/oBh\n5hQ7+0Cb3/jowdVD82B+8ttEpvutrJrnM9NgcECoSMzYujW22xm6GUnEcRB1p32b\nttJXKZQVAgMBAAECggEADLolVZK6U0jMDbvJv3UgstOwD4l3WnteiMSwW+EeZCHJ\na3ZHZRb0NheM9Tl+Cj06BnNzfiT3+rdxigw+PN+hVNnUrYey5XfC27g33vnM+XKb\na+TnTTUa1QVCDkl2a3AnkaSD68BlAZwMyLjOW6V6O5Fhf+CUII1CXmVsYCNcgLfM\nykbPwblgmQE9nwXavhqnOYO/ExK4sG6jP5POnUSJx7B8dPIiIyN/Xty2vTnBzV78\nWqDmdGlIDpdncGD8kvQ68GK/3WJvn28uWu4QoxAXgY1aSe/2fLRXICKpwpqhIK3t\nkf9fXzyfIKre2Y1GingbFav1xfEOKiHRySmS38EF/QKBgQDYYNYVrEzhbvHpPEzz\nYY/gZlY5XdGkZMxO9Ln5mS+3/qTmSZLXgMqwBGZ4c/cHmzro7H32BYCSPjk7G89B\n2iUTpWYv9gnvbLjjGZ48BBLHUJVWfDrqiEMhk74iDOzFb0hYuMBMSjsn/uRk8KiF\nXmqsmyYXTj11IkjWkRdyM98sJwKBgQC38F9QMohD7l8HJKnqNXJlCYuWdqVaHMk6\nqNDUjalzyq/B9o1RxS3kojx1fY1tMifVLbSiJS+QhtNMs8yfU3q4LlIPEHgndieD\n5EtNBdGK6yYvvzVA4K1X2hXzg8TpyW91xEjNueA9GnsYJtu3g+DSASwyg54/mvIN\nohsaaHwXYwKBgQCHmPfQkS+EvrAfB8j5ZJRzfe5e+Opd6UUX3cmGH3eGCLByGH1L\nS8y5Taihp5qRS7g5K6ssN/qAqznWTvEtRXWiwC4vtDI5tpqOxwkgdzUFbvyHPEb3\nnvji2+F1GUBv4fMmlnD73jEAOX4Lu70AB1E2ZewTAtcExr16qWZWDSe4VQKBgQCk\n4cDex91kX3opkhEKFEzuCydoggRpCaLMhWVlE3ORi2APk65MXV9tMozVmO08tBgG\nvUjNjF3dxS4F9Kp5K8C29zaxsEa0wPJdBTkG2y9hwrZhWJopBP394U2KE1VhaCMU\nwxWr7HH49BLhrHuKPpo6RbjTsy4YwBE4bVa0TnLmFwKBgA0UbJ5cgQcxYtkZPC0K\nXRS/8UbqfZLpEP09NoEMOG6WtmeQe73jNS0Y5Va3r39UbnbDPjqQnCycd0SxdUFS\n2GWCOq8E4rTb/PpXOnbA11spW1P/uQB41HRvhc6JHSCVN6bgswkk5iTW3/pRb92l\navz2VU+TwsmR9DVOjh5W00eF\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-y6671@folaringtest.iam.gserviceaccount.com",
  "client_id": "111342035426071172693",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-y6671%40folaringtest.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
});
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const users = [];
const secretKey = process.env.JWT_SECRET_KEY || 'your_secret_key'; // ใช้คีย์จาก environment variables

// เส้นทางสำหรับ Google Sign-In
app.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);
    res.json({
      message: 'Logged in successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register API
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const userExists = users.find((user) => user.username === username);
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', async ({ username, password }, callback) => {
    const userExists = users.find((user) => user.username === username);
    if (userExists) return callback({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    callback({ message: 'User registered successfully' });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3002, () => {
  console.log('Server is running on port 3001');
});
