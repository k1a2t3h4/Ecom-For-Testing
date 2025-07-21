const { products } = require('./products');
const { writeFileSync } = require('fs');
const path = require('path');

// Build collectionList
const collectionMap = new Map();
for (const product of products) {
  for (const collection of product.collections) {
    if (!collectionMap.has(collection)) collectionMap.set(collection, []);
    collectionMap.get(collection).push(product.productId);
  }
}

const collectionList = Array.from(collectionMap.entries()).map(([name, productIds]) => ({
  name,
  productIds
}));

const output = `export const collectionList = ${JSON.stringify(collectionList, null, 2)};\n`;
const outPath = path.join(__dirname, 'collectionList.generated.ts');
writeFileSync(outPath, output);

console.log('collectionList.generated.ts written!'); 