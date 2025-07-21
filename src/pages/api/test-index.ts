import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const explain = await db.collection('products')
      .find({ category: 'Women' })
      .explain('executionStats');
    res.status(200).json(explain);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run explain', details: error });
  }
} 