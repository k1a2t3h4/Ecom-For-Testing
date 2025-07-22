import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';
import { fetchProductsFromDb } from '../../data/fetchProductsFromDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Add caching headers for the batched response
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    
    const db = await getDb();
    
    // Parse query parameters for products
    const { limit, skip, collection, category, tag } = req.query;
    const productFilters: any = {
      limit: limit ? Number(limit) : 20,
      skip: skip ? Number(skip) : 0,
    };
    
    if (typeof collection === 'string') productFilters.collection = collection;
    if (typeof category === 'string') productFilters.category = category;
    if (typeof tag === 'string') productFilters.tag = tag;
    
    // Fetch all data in parallel
    const [products, categoriesDoc, tagsDoc, collectionsDoc] = await Promise.allSettled([
      fetchProductsFromDb(productFilters),
      db.collection('admin').findOne({ _id: 'categoryList' } as any),
      db.collection('admin').findOne({ _id: 'tagList' } as any),
      db.collection('admin').findOne({ _id: 'collectionList' } as any)
    ]);
    
    // Prepare response with error handling
    const response = {
      products: products.status === 'fulfilled' ? products.value : [],
      categories: categoriesDoc.status === 'fulfilled' ? (categoriesDoc.value?.list || []) : [],
      tags: tagsDoc.status === 'fulfilled' ? (tagsDoc.value?.list || []) : [],
      collections: collectionsDoc.status === 'fulfilled' ? (collectionsDoc.value?.list || []) : [],
      errors: []
    };
    
    // Log any errors but don't fail the request
    if (products.status === 'rejected') response.errors.push('products');
    if (categoriesDoc.status === 'rejected') response.errors.push('categories');
    if (tagsDoc.status === 'rejected') response.errors.push('tags');
    if (collectionsDoc.status === 'rejected') response.errors.push('collections');
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in get-store-data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch store data', 
      details: error,
      products: [],
      categories: [],
      tags: [],
      collections: []
    });
  }
}