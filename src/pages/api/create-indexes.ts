import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const products = db.collection('products');
    const index1 = await products.createIndex({ status:1,instock:1,category: 1,tags:1,averageRating:1,price:1,createdAt:-1},{unique:true});
    const index2 = await products.createIndex({ status:1,instock:1,category: 1,"variantOptions.name": 1,"variantOptions.value": 1,averageRating:1,price:1,createdAt:-1},{unique:true});
    res.status(200).json({ message: 'Indexes created', indexes: index1,index2 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create indexes', details: error });
  }
} 