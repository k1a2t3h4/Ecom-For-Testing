'use client'
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Fashion & Apparel Store</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            This header embodies elegance and style with soft gradients, sophisticated typography, 
            and fashion-forward design elements perfect for clothing and accessory retailers.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Back to All Headers
          </Link>
        </div>
      </main>
    </div>
  );
}
