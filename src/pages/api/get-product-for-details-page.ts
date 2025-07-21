import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, slug } = req.query;
  if (!category || !slug || typeof category !== 'string' || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid category or slug' });
  }

  try {
    const db = await getDb();
    const product = await db.collection('products').findOne({ category, slug });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product', details: error });
  }
} 