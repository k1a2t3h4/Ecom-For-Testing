import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/mongodb';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const sessionToken = cookies.session;
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session' });
    }
    const db = await getDb();
    const session = await db.collection('sessions').findOne({ sessionToken });
    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }
    const user = await db.collection('users').findOne({ email: session.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: { email: user.email } });
  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({ error: 'Failed to check session' });
  }
} 