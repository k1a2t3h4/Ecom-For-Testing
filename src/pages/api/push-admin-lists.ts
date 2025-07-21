import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';
import { categoryList } from '../../data/categoryList.generated';
import { collectionList } from '../../data/collectionList.generated';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const adminCollection = db.collection('admin');
    const ops = [
      adminCollection.updateOne(
        { _id: 'categoryList' } as any,
        { $set: { list: categoryList } },
        { upsert: true }
      ),
      adminCollection.updateOne(
        { _id: 'collectionList' } as any,
        { $set: { list: collectionList } },
        { upsert: true }
      )
    ];
    const result = await Promise.all(ops);
    res.status(200).json({ message: 'Admin lists pushed', result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to push admin lists', details: error });
  }
} 