// src/app/collections/filterfunctions.tsx

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function fetchProductsByCollection(collectionName) {
  const res = await fetch(`${baseUrl}/api/get-products?collection=${encodeURIComponent(collectionName)}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductsByCategory(categories: string | string[]) {
  try {
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    const response = await fetch('/api/get-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories: categoryArray }),
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
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
    const response = await fetch('/api/get-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products with filters:', error);
    return [];
  }
}

export async function fetchProductsByTag(tagName) {
  const res = await fetch(`${baseUrl}/api/get-products?tag=${encodeURIComponent(tagName)}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchAllProducts({ limit = 20, skip = 0 } = {}) {
  const res = await fetch(`${baseUrl}/api/get-products?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchTagList() {
  const res = await fetch(`${baseUrl}/api/get-tags`);
  if (!res.ok) throw new Error('Failed to fetch tag list');
  return res.json();
}

export async function fetchCollectionList() {
  const res = await fetch(`${baseUrl}/api/get-collections`);
  if (!res.ok) throw new Error('Failed to fetch collection list');
  return res.json();
}

export async function fetchCategoryList() {
  const res = await fetch(`${baseUrl}/api/get-categories`);
  if (!res.ok) throw new Error('Failed to fetch category list');
  return res.json();
}

// You can add more filter functions as needed (e.g., by price, search, etc.) 