const { products } = require('./products');
const { writeFileSync } = require('fs');
const path = require('path');

// Helper to deep merge variant options by name
function mergeVariantOptions(optionsArr) {
  const map = new Map();
  for (const opts of optionsArr) {
    for (const opt of opts) {
      if (!map.has(opt.name)) map.set(opt.name, new Set());
      for (const val of opt.values) {
        map.get(opt.name).add(val);
      }
    }
  }
  return Array.from(map.entries()).map(([name, values]) => ({ name, values: Array.from(values) }));
}

// Build categoryList
const categoryMap = new Map();
for (const product of products) {
  const category = product.category;
  if (!categoryMap.has(category)) categoryMap.set(category, new Map());
  const tagMap = categoryMap.get(category);
  for (const tag of product.tags) {
    if (!tagMap.has(tag)) tagMap.set(tag, []);
    tagMap.get(tag).push(product.variantOptions);
  }
}

const categoryList = Array.from(categoryMap.entries()).map(([category, tagMap]) => ({
  name: category,
  tags: Array.from(tagMap.entries()).map(([tag, variantOptionsArr]) => ({
    name: tag,
    variantOptions: mergeVariantOptions(variantOptionsArr)
  }))
}));

const output = `export const categoryList = ${JSON.stringify(categoryList, null, 2)};\n`;
const outPath = path.join(__dirname, 'categoryList.generated.ts');
writeFileSync(outPath, output);

console.log('categoryList.generated.ts written!'); 