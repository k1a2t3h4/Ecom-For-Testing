import { getDb } from '../lib/mongodb';

/**
 * Fetch products from the database with optional filters.
 * @param filters { 
 *   collection?: string, 
 *   category?: string, 
 *   categories?: string[],
 *   tag?: string,
 *   tags?: string[],
 *   variantOptions?: { name: string; values: string[] }[],
 *   minPrice?: number,
 *   maxPrice?: number,
 *   minRating?: number,
 *   inStockOnly?: boolean
 * }
 * @returns Array of products
 */
export async function fetchProductsFromDb(filters: {
  collection?: string;
  category?: string;
  categories?: string[];
  tag?: string;
  tags?: string[];
  variantOptions?: { name: string; values: string[] }[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  averageRating?: { gte?: number; lte?: number };
  inStockOnly?: boolean;
  limit?: number;
  skip?: number;
}) {
  const db = await getDb();
  const query: any = {};
  
  // Collection filter
  if (filters.collection) {
    query.collections = filters.collection;
  }
  
  // Category filters (support both single and multiple)
  if (filters.category) {
    query.category = filters.category;
  } else if (filters.categories && filters.categories.length > 0) {
    query.category = { $in: filters.categories };
  }
  
  // Tag filters (support both single and multiple)
  if (filters.tag) {
    query.tags = filters.tag;
  } else if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  // Price range filters
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = filters.maxPrice;
    }
  }
  
  // Stock filter
  if (filters.inStockOnly) {
    query.quantity = { $gt: 0 };
  }
  
  // Variant options filter (all options must match at least one variant combination)
  if (filters.variantOptions && filters.variantOptions.length > 0) {
    // Each option must match at least one variantCombinations.combination
    query.$and = filters.variantOptions.map(option => ({
      'variantCombinations': {
        $elemMatch: {
          [`combination.${option.name}`]: { $in: option.values }
        }
      }
    }));
  }
  
  // Average rating filter
  if (filters.averageRating) {
    if (filters.averageRating.gte !== undefined || filters.averageRating.lte !== undefined) {
      query.averageRating = {};
      if (filters.averageRating.gte !== undefined) {
        query.averageRating.$gte = filters.averageRating.gte;
      }
      if (filters.averageRating.lte !== undefined) {
        query.averageRating.$lte = filters.averageRating.lte;
      }
    }
  } else if (filters.minRating !== undefined) {
    // fallback for minRating (deprecated)
    query.averageRating = { $gte: filters.minRating };
  }

  // Pagination
  const limit = filters.limit ?? 20;
  const skip = filters.skip ?? 0;

  const products = await db.collection('products')
    .find(query)
    .skip(skip)
    .limit(limit)
    .toArray();

  return products;
} 