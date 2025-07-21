import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchProductsFromDb } from '../../data/fetchProductsFromDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    let filters: any = {};
    
    if (req.method === 'GET') {
      const { collection, category, tag, limit, skip, averageRatingGte, averageRatingLte } = req.query;
      filters = {
        collection: typeof collection === 'string' ? collection : undefined,
        category: typeof category === 'string' ? category : undefined,
        tag: typeof tag === 'string' ? tag : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
        averageRating: (averageRatingGte || averageRatingLte) ? {
          gte: averageRatingGte ? Number(averageRatingGte) : undefined,
          lte: averageRatingLte ? Number(averageRatingLte) : undefined
        } : undefined,
      };
    } else if (req.method === 'POST') {
      const { categories, tags, variantOptions, minPrice, maxPrice, minRating, inStockOnly, limit, skip, averageRating } = req.body;
      filters = {
        categories: Array.isArray(categories) ? categories : undefined,
        tags: Array.isArray(tags) ? tags : undefined,
        variantOptions: Array.isArray(variantOptions) ? variantOptions : undefined,
        minPrice: typeof minPrice === 'number' ? minPrice : undefined,
        maxPrice: typeof maxPrice === 'number' ? maxPrice : undefined,
        minRating: typeof minRating === 'number' ? minRating : undefined,
        inStockOnly: typeof inStockOnly === 'boolean' ? inStockOnly : undefined,
        limit: typeof limit === 'number' ? limit : undefined,
        skip: typeof skip === 'number' ? skip : undefined,
        averageRating: averageRating && (averageRating.gte !== undefined || averageRating.lte !== undefined) ? averageRating : undefined,
      };
    }
    
    const products = await fetchProductsFromDb(filters);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error });
  }
} 