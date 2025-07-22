import { getDb } from '../lib/mongodb';

export interface VariantFilterOption {
  name: string;
  values: string[];
}

export async function fetchProductsFromDb(filters: {
  collection?: string;
  category?: string;
  categories?: string[];
  tag?: string;
  tags?: string[];
  variantOptions?: VariantFilterOption[];
  minPrice?: number;
  maxPrice?: number;
  averageRating?: { gte?: number; lte?: number };
  inStockOnly?: boolean;
  limit?: number;
  skip?: number;
}) {
  const db = await getDb();
  const query: any = {};

  // Use required indexed filters
  query.status = 'active';
  query.instock = filters.inStockOnly ? 'true' : { $exists: true };

  if (filters.categories?.length) {
    query.category = { $in: filters.categories };
  } else if (filters.category) {
    query.category = filters.category;
  }
  
  const useVariantOptionQuery = filters.variantOptions?.length && !filters.tags?.length && !filters.tag;
  const useTagsQuery = filters.tags?.length || filters.tag;

  // --- Only variantOptions filter (uses IndexB) ---
  if (useVariantOptionQuery && filters.variantOptions?.length) {
    query.$and = filters.variantOptions.map(opt => ({
      variantOptions: {
        $elemMatch: {
          name: opt.name,
          value: { $in: opt.values }
        }
      }
    }));
  }
  // --- Only tags filter (uses IndexA) ---
  else if (useTagsQuery) {
    if (filters.tags?.length) {
      query.tags = { $in: filters.tags };
    } else if (filters.tag) {
      query.tags = filters.tag;
    }
  }
  // --- Average Rating ---
  if (filters.averageRating) {
    query.averageRating = {
      ...(filters.averageRating.gte !== undefined ? { $gte: filters.averageRating.gte } : {}),
      ...(filters.averageRating.lte !== undefined ? { $lte: filters.averageRating.lte } : {})
    };
  }

  // --- Price Range ---
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {
      ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {})
    };
  }

  if (!useVariantOptionQuery && filters.variantOptions?.length ) {
    query.$and = filters.variantOptions.map(opt => ({
      variantOptions: {
        $elemMatch: {
          name: opt.name,
          value: { $in: opt.values }
        }
      }
    }));
  }
  // --- Pagination ---
  const limit = filters.limit ?? 20;
  const skip = filters.skip ?? 0;
console.log(query)
// const result = await db.collection('products')
//   .find(query)
//   .explain('executionStats');

// console.log(JSON.stringify(result, null, 2));

  // --- Final Query Execution ---
  const products = await db.collection('products')
    .find(query)
    // .sort({ createdAt: -1 }) // matches index
    .skip(skip)
    .limit(limit)
    .toArray();

  return products;
}
