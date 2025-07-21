import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/mongodb';
import { parse, serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const sessionToken = cookies.session;
    if (sessionToken) {
      const db = await getDb();
      await db.collection('sessions').deleteOne({ sessionToken });
    }
    res.setHeader('Set-Cookie', serialize('session', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }));
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }
} 