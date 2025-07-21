'use client';

import React, { createContext, useContext } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    inventory: number;
    featured: boolean;
}

export const products: Product[] = [
    {
      id: '1',
      name: 'Classic White T-Shirt',
      description: 'A comfortable white t-shirt made from 100% cotton.',
      price: 19.99,
      category: 'tshirts',
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600',
      inventory: 50,
      featured: true
    },
    {
      id: '2',
      name: 'Slim Fit Jeans',
      description: 'Modern slim fit jeans perfect for any casual occasion.',
      price: 49.99,
      category: 'jeans',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600',
      inventory: 30,
      featured: true
    },
    {
      id: '3',
      name: 'Sports Running Shoes',
      description: 'Lightweight running shoes with excellent cushioning.',
      price: 79.99,
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600',
      inventory: 25,
      featured: false
    },
    {
      id: '4',
      name: 'Summer Floral Dress',
      description: 'Beautiful floral pattern dress perfect for summer days.',
      price: 59.99,
      category: 'dresses',
      imageUrl: 'https://images.unsplash.com/photo-1612722432474-b971cdcea26d?q=80&w=600',
      inventory: 15,
      featured: true
    },
    {
      id: '5',
      name: 'Leather Jacket',
      description: 'Classic leather jacket that never goes out of style.',
      price: 149.99,
      category: 'jackets',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600',
      inventory: 10,
      featured: false
    },
    {
      id: '6',
      name: 'Winter Knit Sweater',
      description: 'Warm and cozy knit sweater for cold winter days.',
      price: 69.99,
      category: 'sweaters',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600',
      inventory: 20,
      featured: true
    },
    {
      id: '7',
      name: 'Casual Chino Pants',
      description: 'Versatile chino pants suitable for both casual and formal occasions.',
      price: 45.99,
      category: 'pants',
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
      inventory: 35,
      featured: false
    },
    {
      id: '8',
      name: 'Cotton Polo Shirt',
      description: 'Classic polo shirt made from high-quality cotton.',
      price: 34.99,
      category: 'tshirts',
      imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=600',
      inventory: 40,
      featured: true
    }
];

// collections array removed; now provided by ProductWrapper.tsx

interface FilterContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredProducts: any[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    showFeaturedOnly: boolean;
    setShowFeaturedOnly: (featured: boolean) => void;
    // handleSearch: (query: string) => void;
    applyFilters: () => void;
    filterProducts: (
      category: string,
      query: string,
      price: [number, number],
      sort: string,
      featured: boolean
    ) => any[];
}

export const FilterContext = createContext<FilterContextType | null>(null);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredProducts, setFilteredProducts] = React.useState(products);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = React.useState('default');
  const [showFeaturedOnly, setShowFeaturedOnly] = React.useState(false);

  const filterProducts = (
    category: string,
    query: string,
    price: [number, number],
    sort: string,
    featured: boolean
  ) => {
    let filtered = [...products];
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery)
      );
    }
    filtered = filtered.filter(product =>
      product.price >= price[0] && product.price <= price[1]
    );
    if (featured) {
      filtered = filtered.filter(product => product.featured);
    }
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    setFilteredProducts(filtered);
    return filtered;
  };

  // React.useEffect(() => {
  //   const category = searchParams.get('category');
  //   const minPrice = searchParams.get('minPrice');
  //   const maxPrice = searchParams.get('maxPrice');
  //   const sort = searchParams.get('sort');
  //   const featured = searchParams.get('featured');
  //   const query = searchParams.get('q');
  //   if (category) setSelectedCategory(category);
  //   if (minPrice && maxPrice) setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
  //   if (sort) setSortBy(sort);
  //   if (featured) setShowFeaturedOnly(featured === 'true');
  //   if (query) setSearchQuery(query);
  //   filterProducts(
  //     category || selectedCategory,
  //     query || searchQuery,
  //     minPrice && maxPrice ? [parseInt(minPrice), parseInt(maxPrice)] : priceRange,
  //     sort || sortBy,
  //     featured ? featured === 'true' : showFeaturedOnly
  //   );
  // }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    if (sortBy !== 'default') {
      params.set('sort', sortBy);
    }
    if (showFeaturedOnly) {
      params.set('featured', 'true');
    }
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    router.push(pathname + '?' + params.toString());
  };

  // const handleSearch = (query: string) => {
  //   setSearchQuery(query);
  //   const params = new URLSearchParams(searchParams.toString());
  //   if (query) {
  //     params.set('q', query);
  //   } else {
  //     params.delete('q');
  //   }
  //   router.push(pathname + '?' + params.toString());
  //   filterProducts(
  //     selectedCategory,
  //     query,
  //     priceRange,
  //     sortBy,
  //     showFeaturedOnly
  //   );
  // };

  const contextValue = {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    showFeaturedOnly,
    setShowFeaturedOnly,
    // handleSearch,
    applyFilters,
    filterProducts
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

