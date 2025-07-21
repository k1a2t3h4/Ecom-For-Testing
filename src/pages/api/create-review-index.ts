import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const result = await db.collection('reviews').createIndex({ category:1,productId: 1,createdAt:-1});
    res.status(200).json({ message: 'Index created', indexName: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 