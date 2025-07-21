import { getDb } from '../../../lib/mongodb';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import React from 'react';

const QuantitySelector = dynamic(() => import('../../../ui/QuantitySelector'), { ssr: false });
const VariantSelector = dynamic(() => import('../../../ui/VariantSelector'), { ssr: false });
const ImageModal = dynamic(() => import('../../../ui/ImageModal'), { ssr: false });

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export async function generateMetadata({ params }: { params: { category: string, slug: string } }): Promise<Metadata> {
  const db = await getDb();
  const product = await db.collection('products').findOne({ category: params.category, slug: params.slug });
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.productName,
    description: product.detailedDescription,
    openGraph: {
      title: product.productName,
      description: product.detailedDescription,
      images: product.globalMedia?.[0]?.url ? [product.globalMedia[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { category: string, slug: string } }) {
  const db = await getDb();
  const product = await db.collection('products').findOne({ category: params.category, slug: params.slug });
  if (!product) {
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

  // SEO and static parts rendered on server
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-yellow-50">
      {/* Media Gallery (client modal for zoom) */}
      <ImageModal product={product} />
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Media Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative">
              {product.globalMedia && product.globalMedia.length > 0 ? (
                <img
                  src={product.globalMedia[0]?.url}
                  alt={product.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🖼️</div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                <div className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</div>
              </div>
            </div>
            {/* Thumbnail Gallery */}
            {product.globalMedia && product.globalMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.globalMedia.map((media: any, idx: number) => (
                  <img
                    key={idx}
                    src={media.url}
                    alt=""
                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200"
                  />
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
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < Math.floor(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
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

            {/* Variant Selection (client) */}
            {product.variantOptions && product.variantOptions.length > 0 && (
              <VariantSelector variantOptions={product.variantOptions} />
            )}

            {/* Quantity & Actions (client) */}
            <QuantitySelector product={product} />

            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{product.status}</span>
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
                const percentage = product.totalReviews > 0 ? (count / product.totalReviews) * 100 : 0;
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
                        <span className={`px-2 py-1 text-xs rounded-full ${comb.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{comb.status}</span>
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
    </div>
  );
}