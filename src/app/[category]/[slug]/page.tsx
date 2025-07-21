'use client'
import React from 'react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

async function fetchProductByCategorySlug(category: string, slug: string) {
  const res = await fetch(`/api/get-product-by-category-slug?category=${encodeURIComponent(category)}&slug=${encodeURIComponent(slug)}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

// Mock product data for demonstration
const mockProduct = {
  productId: "prod-001",
  productName: "Premium Wireless Headphones with Active Noise Cancellation",
  slug: "premium-wireless-headphones",
  meeshopageUrl: "https://meesho.com/product/premium-headphones",
  status: "active",
  detailedDescription: "Experience superior audio quality with our premium wireless headphones featuring active noise cancellation technology. These headphones are designed for comfort during extended listening sessions and deliver crystal-clear sound across all frequencies. Perfect for music lovers, professionals, and anyone who values high-quality audio experience.",
  price: 2999,
  compareAtPrice: 4999,
  trackQuantity: true,
  sku: "WH-001-BLK",
  quantity: "50",
  barcode: "1234567890123",
  category: "Electronics",
  tags: ["wireless", "bluetooth", "noise-cancelling", "premium", "audio"],
  collections: ["Featured Products", "Best Sellers", "Electronics"],
  globalMedia: [
    { type: "image", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop" },
    { type: "image", url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop" },
    { type: "image", url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop" },
    { type: "image", url: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&h=800&fit=crop" }
  ],
  variantOptions: [
    { name: "Color", values: ["Black", "White", "Silver", "Rose Gold"] },
    { name: "Size", values: ["Regular", "Large"] }
  ],
  variantCombinations: [
    {
      combination: { Color: "Black", Size: "Regular" },
      variantId: "var-001",
      variantName: "Black Regular",
      status: "active",
      variantMedia: [],
      price: 2999,
      compareAtPrice: 4999,
      sku: "WH-001-BLK-REG",
      barcode: "1234567890124",
      trackQuantity: true,
      quantity: "25",
      vendor: "AudioTech"
    },
    {
      combination: { Color: "White", Size: "Regular" },
      variantId: "var-002",
      variantName: "White Regular",
      status: "active",
      variantMedia: [],
      price: 2999,
      compareAtPrice: 4999,
      sku: "WH-001-WHT-REG",
      barcode: "1234567890125",
      trackQuantity: true,
      quantity: "15",
      vendor: "AudioTech"
    },
    {
      combination: { Color: "Silver", Size: "Large" },
      variantId: "var-003",
      variantName: "Silver Large",
      status: "active",
      variantMedia: [],
      price: 3299,
      compareAtPrice: 5299,
      sku: "WH-001-SLV-LRG",
      barcode: "1234567890126",
      trackQuantity: true,
      quantity: "10",
      vendor: "AudioTech"
    }
  ],
  alternativeVendor: "AudioTech Solutions",
  createdAt: "2024-01-15T10:30:00Z",
  ratings: {
    "5_star": 45,
    "4_star": 12,
    "3_star": 5,
    "2_star": 2,
    "1_star": 1
  },
  totalReviews: 65,
  averageRating: 4.5
};

export default function ProductDetailPage({ params }: { params?: { category: string, slug: string } }) {
  const [product, setProduct] = React.useState<any>(mockProduct);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedVariants, setSelectedVariants] = React.useState<{[key: string]: string}>({});
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (params?.category && params?.slug) {
      setLoading(true);
      setError(null);
      fetchProductByCategorySlug(params.category, params.slug)
        .then((data) => {
          setProduct(data || mockProduct);
          setLoading(false);
        })
        .catch(() => {
          setProduct(mockProduct);
          setLoading(false);
        });
    }
  }, [params?.category, params?.slug]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const getRatingPercentage = (starCount: number, totalReviews: number) => {
    return totalReviews > 0 ? (starCount / totalReviews) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-yellow-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-medium text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-yellow-50">
        <div className="text-center space-y-4">
          <div className="text-6xl text-pink-300">🛍️</div>
          <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-yellow-50">
      {/* Modal for image gallery */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white text-xl bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
            >
              ✕
            </button>
            <div className="bg-white rounded-2xl p-4">
              <img
                src={product.globalMedia[selectedImageIndex]?.url}
                alt={product.productName}
                className="w-full h-96 object-contain rounded-xl"
              />
              <div className="flex gap-2 mt-4 justify-center">
                {product.globalMedia.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === selectedImageIndex ? 'bg-pink-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Media Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
              onClick={() => setIsModalOpen(true)}
            >
              {product.globalMedia && product.globalMedia.length > 0 ? (
                <img
                  src={product.globalMedia[selectedImageIndex]?.url}
                  alt={product.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  🖼️
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                <div className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.globalMedia && product.globalMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.globalMedia.map((media: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                      idx === selectedImageIndex
                        ? 'ring-3 ring-pink-500 ring-offset-2'
                        : 'hover:ring-2 hover:ring-pink-300 hover:ring-offset-1'
                    }`}
                  >
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.productName}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {renderStars(product.averageRating || 0)}
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  {product.averageRating || 0}
                </span>
                <span className="text-gray-600">
                  ({product.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-green-600">₹{product.price}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{product.compareAtPrice}</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                      {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variant Selection */}
            {product.variantOptions && product.variantOptions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Options</h3>
                {product.variantOptions.map((option: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{option.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value: string, vIdx: number) => (
                        <button
                          key={vIdx}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [option.name]: value }))}
                          className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                            selectedVariants[option.name] === value
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-200 hover:border-pink-300 text-gray-700'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
                  Add to Cart
                </button>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barcode:</span>
                    <span className="font-medium">{product.barcode}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{product.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags & Collections */}
            {(product.tags?.length > 0 || product.collections?.length > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                {product.tags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.collections?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Collections</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.collections.map((collection: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full"
                        >
                          {collection}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {product.detailedDescription && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.detailedDescription}</p>
          </div>
        )}

        {/* Ratings Breakdown */}
        {product.ratings && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = product.ratings[`${star}_star`] || 0;
                const percentage = getRatingPercentage(count, product.totalReviews);
                return (
                  <div key={star} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{star}</span>
                      <span className="text-yellow-400">★</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Variant Combinations Table */}
        {product.variantCombinations && product.variantCombinations.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Variants</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Combination</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variantCombinations.map((comb: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(comb.combination).map(([k, v]) => (
                            <span key={k} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {k}: {v as string}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">₹{comb.price}</span>
                          {comb.compareAtPrice > comb.price && (
                            <span className="text-xs text-gray-500 line-through">₹{comb.compareAtPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{comb.sku}</td>
                      <td className="py-3 px-4">{comb.quantity}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          comb.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {comb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* External Links */}
        {product.meeshopageUrl && (
          <div className="mt-8 text-center">
            <a
              href={product.meeshopageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-yellow-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-pink-700 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span>View on Meesho</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </div>

      {/* Sticky Mobile Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden">
        <div className="flex gap-3">
          <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Add to Cart
          </button>
          <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
            Buy Now
          </button>
        </div>
      </div>

      {/* Bottom spacing for mobile sticky bar */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
}