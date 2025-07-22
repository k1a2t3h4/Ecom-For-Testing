// src/app/collections/filterfunctions.tsx

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

// Smart caching fetch wrapper
async function smartFetch(url: string, options: RequestInit = {}, cacheTime: number = 10000) {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Return existing promise if already in flight
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }
  
  const fetchPromise = fetch(url, {
    ...options,
    // Add keep-alive for connection reuse
    headers: {
      'Connection': 'keep-alive',
      ...options.headers
    }
  })
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .finally(() => {
      // Clear cache after specified time
      setTimeout(() => requestCache.delete(cacheKey), cacheTime);
    });
  
  requestCache.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function fetchProductsByCollection(collectionName) {
  return smartFetch(`${baseUrl}/api/get-products?collection=${encodeURIComponent(collectionName)}`, {}, 30000);
}

export async function fetchProductsByCategory(categories: string | string[]) {
  try {
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    return smartFetch('/api/get-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories: categoryArray }),
    }, 15000); // Shorter cache for filtered results
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function fetchProductsByMultipleFilters(filters: {
  categories?: string[];
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
  try {
    return smartFetch('/api/get-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    }, 5000); // Short cache for filtered results since they change frequently
  } catch (error) {
    console.error('Error fetching products with filters:', error);
    return [];
  }
}

export async function fetchProductsByTag(tagName) {
  return smartFetch(`${baseUrl}/api/get-products?tag=${encodeURIComponent(tagName)}`, {}, 30000);
}

export async function fetchAllProducts({ limit = 20, skip = 0 } = {}) {
  return smartFetch(`${baseUrl}/api/get-products?limit=${limit}&skip=${skip}`, {}, 60000); // Longer cache for paginated results
}

export async function fetchTagList() {
  return smartFetch(`${baseUrl}/api/get-tags`, {}, 300000); // 5 minute cache - tags change infrequently
}

export async function fetchCollectionList() {
  return smartFetch(`${baseUrl}/api/get-collections`, {}, 300000); // 5 minute cache
}

export async function fetchCategoryList() {
  return smartFetch(`${baseUrl}/api/get-categories`, {}, 300000); // 5 minute cache
}

// Batch fetch for initial filter data
export async function fetchAllFilterData() {
  try {
    // Fetch all filter data in parallel with Promise.allSettled for error resilience
    const [tags, collections, categories] = await Promise.allSettled([
      fetchTagList(),
      fetchCollectionList(), 
      fetchCategoryList()
    ]);
    
    return {
      tags: tags.status === 'fulfilled' ? tags.value : { list: [] },
      collections: collections.status === 'fulfilled' ? collections.value : { list: [] },
      categories: categories.status === 'fulfilled' ? categories.value : { list: [] }
    };
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return {
      tags: { list: [] },
      collections: { list: [] },
      categories: { list: [] }
    };
  }
}

// You can add more filter functions as needed (e.g., by price, search, etc.) 