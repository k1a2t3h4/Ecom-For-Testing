import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/mongodb';
import { serialize } from 'cookie';
import { randomBytes } from 'crypto';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

async function verifyAndDeleteOtp(db: any, email: string, otp: string) {
  const otpDoc = await db.collection('otps').findOne({ email, otp });
  if (!otpDoc) return null;
  await db.collection('otps').deleteOne({ _id: otpDoc._id });
  return otpDoc;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const db = await getDb();
    const otpDoc = await verifyAndDeleteOtp(db, email, otp);
    if (!otpDoc) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    // Upsert user
    const user = await db.collection('users').findOneAndUpdate(
      { email },
      { $setOnInsert: { email, createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    // Create session
    const sessionToken = randomBytes(32).toString('hex');
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('sessions').insertOne({
      sessionToken,
      email,
      userId: user && user.value ? user.value._id : null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    });

    // Set cookie
    res.setHeader('Set-Cookie', serialize('session', sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }));

    return res.status(200).json({ success: true, user: { email } });
  } catch (error) {
    console.error('OTP verify error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
} 