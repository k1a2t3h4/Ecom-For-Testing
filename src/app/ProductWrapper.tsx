export async function getAllProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-products`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getAllCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getAllTags() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-tags`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

export async function getAllCollections() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/get-collections`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
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