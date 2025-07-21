import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const doc = await db.collection('admin').findOne({ _id: 'tagList' } as any);
    res.status(200).json({ list: doc?.list || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tag list', details: error });
  }
} 