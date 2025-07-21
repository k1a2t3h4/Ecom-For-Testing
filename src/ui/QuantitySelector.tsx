'use client';
import React from 'react';

interface QuantitySelectorProps {
  product: any;
}

export default function QuantitySelector({ product }: QuantitySelectorProps) {
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = () => {
    // Implement add to cart logic here
    alert(`Added ${quantity} of ${product.productName} to cart!`);
  };

  const handleBuyNow = () => {
    // Implement buy now logic here
    alert(`Buying ${quantity} of ${product.productName}!`);
  };

  return (
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
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105" onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
} 