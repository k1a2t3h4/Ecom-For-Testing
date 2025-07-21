import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const products = db.collection('products');
    const index = await products.createIndex({ category: 1, productId: 1 },{unique:true});
    res.status(200).json({ message: 'Indexes created', indexes: index });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create indexes', details: error });
  }
} 