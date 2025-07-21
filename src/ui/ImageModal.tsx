'use client';
import React from 'react';

interface ImageModalProps {
  product: any;
}

export default function ImageModal({ product }: ImageModalProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  if (!product?.globalMedia?.length) return null;

  return (
    <>
      {/* <div
        className="hidden lg:block absolute top-0 left-0 w-full h-full z-10"
        style={{ pointerEvents: 'none' }}
      />
      <div
        className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={product.globalMedia[selectedImageIndex]?.url}
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
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
      )} */}
    </>
  );
} 