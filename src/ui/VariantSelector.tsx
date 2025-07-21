'use client';
import React from 'react';

interface VariantSelectorProps {
  variantOptions: Array<{ name: string; values: string[] }>;
}

export default function VariantSelector({ variantOptions }: VariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = React.useState<{ [key: string]: string }>({});

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Options</h3>
      {variantOptions.map((option, idx) => (
        <div key={idx} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{option.name}</label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value, vIdx) => (
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
  );
} 