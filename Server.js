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
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
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
