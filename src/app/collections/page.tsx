'use client';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  fetchCategoryList,
  fetchProductsByMultipleFilters
} from './filterfunctions';

export default function CollectionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<{ name: string; values: string[] }[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minReviews, setMinReviews] = useState('');
  const [loading, setLoading] = useState(false);
  const [averageRatingFilter, setAverageRatingFilter] = useState('');
  const [averageRatingMode, setAverageRatingMode] = useState<'gte' | 'lte'>('gte');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

  // Fetch categories and categoryList on mount
  useEffect(() => {
    async function fetchFilters() {
      const categoriesRes = await fetchCategoryList();
      setCategories(categoriesRes.list || []);
      setCategoryList(categoriesRes.list || []);
    }
    fetchFilters();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setProducts([]);
    setHasMore(true);
  }, [selectedCategories, selectedTags, selectedVariantOptions, selectedRatings, minPrice, maxPrice, inStockOnly, averageRatingFilter, averageRatingMode]);

  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        const filters: any = {};
        if (selectedCategories.length > 0) filters.categories = selectedCategories;
        if (selectedTags.length > 0) filters.tags = selectedTags;
        if (selectedVariantOptions.length > 0) filters.variantOptions = selectedVariantOptions;
        if (selectedRatings.length > 0) filters.minRating = Math.min(...selectedRatings);
        if (minPrice && !isNaN(Number(minPrice))) filters.minPrice = Number(minPrice);
        if (maxPrice && !isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice);
        if (inStockOnly) filters.inStockOnly = true;
        if (averageRatingFilter && !isNaN(Number(averageRatingFilter))) {
          filters.averageRating = { [averageRatingMode]: Number(averageRatingFilter) };
        }
        filters.limit = limit;
        filters.skip = 0;
        let prods = await fetchProductsByMultipleFilters(filters);
        setProducts(prods);
        setHasMore(prods.length === limit);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
    // eslint-disable-next-line
  }, [selectedCategories, selectedTags, selectedVariantOptions, selectedRatings, minPrice, maxPrice, inStockOnly, averageRatingFilter, averageRatingMode]);

  const loadMoreProducts = async () => {
    setLoadingMore(true);
    try {
      const filters: any = {};
      if (selectedCategories.length > 0) filters.categories = selectedCategories;
      if (selectedTags.length > 0) filters.tags = selectedTags;
      if (selectedVariantOptions.length > 0) filters.variantOptions = selectedVariantOptions;
      if (selectedRatings.length > 0) filters.minRating = Math.min(...selectedRatings);
      if (minPrice && !isNaN(Number(minPrice))) filters.minPrice = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice);
      if (inStockOnly) filters.inStockOnly = true;
      if (averageRatingFilter && !isNaN(Number(averageRatingFilter))) {
        filters.averageRating = { [averageRatingMode]: Number(averageRatingFilter) };
      }
      filters.limit = limit;
      filters.skip = products.length;
      let prods = await fetchProductsByMultipleFilters(filters);
      setProducts(prev => [...prev, ...prods]);
      setHasMore(prods.length === limit);
    } finally {
      setLoadingMore(false);
    }
  };

  // Remove client-side filtering: filteredProducts is just products
  const filteredProducts = products;

  // Multi-selection handlers
  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleVariantOptionToggle = (optionName: string, value: string) => {
    setSelectedVariantOptions(prev => {
      const existing = prev.find(opt => opt.name === optionName);
      if (existing) {
        const newValues = existing.values.includes(value)
          ? existing.values.filter(v => v !== value)
          : [...existing.values, value];
        
        if (newValues.length === 0) {
          return prev.filter(opt => opt.name !== optionName);
        } else {
          return prev.map(opt => 
            opt.name === optionName 
              ? { ...opt, values: newValues }
              : opt
          );
        }
      } else {
        return [...prev, { name: optionName, values: [value] }];
      }
    });
  };

  const handleRatingToggle = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  // Other handlers
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };
  const handleCreatedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatedAt(e.target.value);
  };
  const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInStockOnly(e.target.checked);
  };
  const handleMinReviewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinReviews(e.target.value);
  };

  // Available tags based on selected categories
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    if (selectedCategories.length > 0) {
      selectedCategories.forEach(catName => {
        const cat = categoryList.find((c: any) => c.name === catName);
        if (cat?.tags) {
          cat.tags.forEach((tag: any) => tagSet.add(tag.name));
        }
      });
    } else {
      categoryList.forEach((cat: any) => {
        if (cat.tags) {
          cat.tags.forEach((tag: any) => tagSet.add(tag.name));
        }
      });
    }
    return Array.from(tagSet);
  }, [selectedCategories, categoryList]);

  // Available variant options based on selected tags or categories
  const availableVariantOptions = useMemo(() => {
    const optionMap = new Map<string, Set<string>>();
    if (selectedTags.length > 0) {
      selectedTags.forEach(tagName => {
        categoryList.forEach((cat: any) => {
          const tag = cat.tags?.find((t: any) => t.name === tagName);
          if (tag?.variantOptions) {
            tag.variantOptions.forEach((opt: any) => {
              if (!optionMap.has(opt.name)) {
                optionMap.set(opt.name, new Set());
              }
              opt.values.forEach((val: string) => optionMap.get(opt.name)!.add(val));
            });
          }
        });
      });
    } else if (selectedCategories.length > 0) {
      selectedCategories.forEach(catName => {
        const cat = categoryList.find((c: any) => c.name === catName);
        cat?.tags?.forEach((tag: any) => {
          tag.variantOptions?.forEach((opt: any) => {
            if (!optionMap.has(opt.name)) {
              optionMap.set(opt.name, new Set());
            }
            opt.values.forEach((val: string) => optionMap.get(opt.name)!.add(val));
          });
        });
      });
    } else {
      categoryList.forEach((cat: any) => {
        cat.tags?.forEach((tag: any) => {
          tag.variantOptions?.forEach((opt: any) => {
            if (!optionMap.has(opt.name)) {
              optionMap.set(opt.name, new Set());
            }
            opt.values.forEach((val: string) => optionMap.get(opt.name)!.add(val));
          });
        });
      });
    }
    return Array.from(optionMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values).sort()
    }));
  }, [selectedTags, selectedCategories, categoryList]);

  return (
    <div className="flex max-w-7xl mx-auto p-4 gap-6">
      {/* Left Sidebar - Filters (20%) */}
      <div className="w-1/5 bg-gray-50 p-4 rounded-lg h-fit sticky top-4">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        
        {/* Categories */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Categories</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categoryList.map((c: any) => (
              <label key={c.name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.name)}
                  onChange={() => handleCategoryToggle(c.name)}
                  className="rounded"
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Tags</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableTags.map((tag: string) => (
              <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="rounded"
                />
                <span className="text-sm">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Variant Options */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Variant Options</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {availableVariantOptions.map((option: any) => (
              <div key={option.name}>
                <h4 className="text-sm font-medium text-gray-700 mb-1">{option.name}</h4>
                <div className="space-y-1 ml-2">
                  {option.values.map((value: string) => (
                    <label key={value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVariantOptions.some(opt => 
                          opt.name === option.name && opt.values.includes(value)
                        )}
                        onChange={() => handleVariantOptionToggle(option.name, value)}
                        className="rounded"
                      />
                      <span className="text-xs">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Ratings</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(rating)}
                  onChange={() => handleRatingToggle(rating)}
                  className="rounded"
                />
                <span className="text-sm">{rating}★ & up</span>
              </label>
            ))}
          </div>
        </div>

        {/* Average Rating */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Average Rating</h3>
          <div className="flex items-center gap-2">
            <select
              value={averageRatingMode}
              onChange={e => setAverageRatingMode(e.target.value as 'gte' | 'lte')}
              className="p-2 border rounded text-sm"
            >
              <option value="gte">≥</option>
              <option value="lte">≤</option>
            </select>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              placeholder="Avg Rating"
              value={averageRatingFilter}
              onChange={e => setAverageRatingFilter(e.target.value)}
              className="w-20 p-2 border rounded text-sm"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Price Range</h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={handleMinPriceChange}
              className="w-full p-2 border rounded text-sm"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>

        {/* Other Filters */ }
        <div className="mb-6">
          <h3 className="font-medium mb-2">Other Filters</h3>
          <div className="space-y-3">
            <input
              type="date"
              value={createdAt}
              onChange={handleCreatedAtChange}
              className="w-full p-2 border rounded text-sm"
            />
            <input
              type="number"
              placeholder="Min Reviews"
              value={minReviews}
              onChange={handleMinReviewsChange}
              className="w-full p-2 border rounded text-sm"
            />
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={handleInStockChange}
                className="rounded"
              />
              <span className="text-sm">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSelectedCategories([]);
            setSelectedTags([]);
            setSelectedVariantOptions([]);
            setSelectedRatings([]);
            setMinPrice('');
            setMaxPrice('');
            setCreatedAt('');
            setInStockOnly(false);
            setMinReviews('');
            setAverageRatingFilter('');
            setAverageRatingMode('gte');
          }}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Right Side - Product Grid (80%) */}
      <div className="w-4/5">
        {/* Header with results count and sorting */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold">
            {loading ? 'Loading...' : `${filteredProducts.length} Products`}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: any) => (
                <div key={product.productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    {product.globalMedia && product.globalMedia.length > 0 ? (
                      <img
                        src={product.globalMedia[0].url}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <span className="text-xs font-medium text-green-600">
                        {product.averageRating ? `${product.averageRating}★` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.productName}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.compareAtPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{product.category}</span>
                      <span>{product.totalReviews || 0} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreProducts}
                  disabled={loadingMore}
                  className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 