import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/mongodb';
import nodemailer from 'nodemailer';

const OTP_TTL_SECONDS = 300; // 5 minutes

async function sendOtp(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Your Login OTP',
    html: `Your verification code is: <strong>${otp}</strong>`,
    text: `Your verification code is: ${otp}`,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const db = await getDb();
    // Store OTP with TTL
    await db.collection('otps').createIndex({ createdAt: 1 }, { expireAfterSeconds: OTP_TTL_SECONDS });
    await db.collection('otps').insertOne({ email, otp, createdAt: new Date() });

    // Send OTP via email
    await sendOtp(email, otp);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('OTP send error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
} 