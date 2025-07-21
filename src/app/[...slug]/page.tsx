import React from 'react';
import Link from 'next/link';
import { collections } from '../ProductWrapper';

interface PageProps {
  params: { slug: string[] };
}

export default function CollectionItemPage({ params }: PageProps) {
  const [collectionName, itemName] = params.slug || [];
  const collection = collections.find(c => c.name.toLowerCase() === (collectionName || '').toLowerCase());
  const itemExists = collection && collection.items.includes(itemName);

  if (!collection || !itemExists) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">404 - Not Found</h1>
        <p className="mb-6">The collection or item you are looking for does not exist.</p>
        <Link href="/" className="text-blue-600 underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <header className="bg-white shadow-lg border-b border-pink-100">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">👗</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Elegante
            </span>
          </Link>
          <Link href="/" className="text-pink-600 font-semibold hover:text-pink-700 transition-colors duration-200">
            Home
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{collection.name}</h1>
          <h2 className="text-2xl text-pink-600 mb-6">{itemName}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Explore our exclusive selection of {itemName} in the {collection.name} collection.
          </p>
          <Link href="/" className="inline-block bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}