import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For demo, use the provided values
  const productId = 'PZNFLI';
  const userId = 'U7S48L';
  const rating = 2;

  try {
    const db = await getDb();
    const collection = db.collection('reviews');

    // Measure query time
    const start = process.hrtime();
    const query = { productId, rating, userId };
    const explain = await collection.find(query).explain('executionStats');
    const end = process.hrtime(start);
    const timeMs = end[0] * 1000 + end[1] / 1e6;

    // Get collection stats using db.command
    const stats = await db.command({ collStats: 'reviews' });
    const indexInfo = await collection.indexInformation({ full: true });

    // Get the actual doc for confirmation
    const doc = await collection.findOne(query);

    res.status(200).json({
      query,
      doc,
      timeMs,
      explain,
      stats,
      indexInfo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 