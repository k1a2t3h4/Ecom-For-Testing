// Cache for request deduplication
const fetchCache = new Map<string, Promise<any>>();

// Helper function to create cache key
function getCacheKey(url: string, options?: RequestInit): string {
  return `${url}_${JSON.stringify(options || {})}`;
}

// Enhanced fetch with deduplication and error handling
async function cachedFetch(url: string, options: RequestInit & { cacheDuration?: number } = {}) {
  const { cacheDuration = 30000, ...fetchOptions } = options; // 30s default cache
  const cacheKey = getCacheKey(url, fetchOptions);
  
  // Return existing promise if request is in flight
  if (fetchCache.has(cacheKey)) {
    return fetchCache.get(cacheKey)!;
  }
  
  // Create new fetch promise
  const fetchPromise = fetch(url, fetchOptions)
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .finally(() => {
      // Clear cache after duration
      setTimeout(() => fetchCache.delete(cacheKey), cacheDuration);
    });
  
  fetchCache.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function getAllProducts() {
  return cachedFetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-products`, { 
    cacheDuration: 60000 // 1 minute cache for products
  });
}

export async function getAllCategories() {
  return cachedFetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-categories`, { 
    cacheDuration: 300000 // 5 minute cache for categories (changes less frequently)
  });
}

export async function getAllTags() {
  return cachedFetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-tags`, { 
    cacheDuration: 300000 // 5 minute cache for tags
  });
}

export async function getAllCollections() {
  return cachedFetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-collections`, { 
    cacheDuration: 300000 // 5 minute cache for collections
  });
}

// Batch fetch function for initial page load
export async function getAllStoreData() {
  try {
    // Fetch all data in parallel instead of sequential
    const [products, categories, tags, collections] = await Promise.allSettled([
      getAllProducts(),
      getAllCategories(), 
      getAllTags(),
      getAllCollections()
    ]);
    
    return {
      products: products.status === 'fulfilled' ? products.value : [],
      categories: categories.status === 'fulfilled' ? categories.value : { list: [] },
      tags: tags.status === 'fulfilled' ? tags.value : { list: [] },
      collections: collections.status === 'fulfilled' ? collections.value : { list: [] }
    };
  } catch (error) {
    console.error('Error fetching store data:', error);
    return {
      products: [],
      categories: { list: [] },
      tags: { list: [] },
      collections: { list: [] }
    };
  }
}

// NEW: Single request batch fetch (even better performance)
export async function getBatchedStoreData(options: {
  limit?: number;
  skip?: number;
  collection?: string;
  category?: string;
  tag?: string;
} = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.skip) params.set('skip', options.skip.toString());
  if (options.collection) params.set('collection', options.collection);
  if (options.category) params.set('category', options.category);
  if (options.tag) params.set('tag', options.tag);
  
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-store-data${params.toString() ? '?' + params.toString() : ''}`;
  
  return cachedFetch(url, { 
    cacheDuration: 60000 // 1 minute cache
  });
}

// const { products, categories, tags, collections, loading } = useProductData();
export const collections = [
  {
    name: "Women",
    items: ["Dresses", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"]
  },
  {
    name: "Men",
    items: ["Shirts", "Pants", "Suits", "Casual", "Footwear", "Watches"]
  },
  {
    name: "Kids",
    items: ["Girls", "Boys", "Baby", "School Wear", "Party Wear"]
  },
  {
    name: "Brands",
    items: ["Premium", "Designer", "Sustainable", "Local Brands"]
  }
];