const fs = require('fs');

// Read HTML content from a file
const htmlFilePath = 'input.html';
const inputString = fs.readFileSync(htmlFilePath, 'utf-8');

// Function to extract all URLs from src attributes in any string, filtered by prefix
function extractSrcUrls(str) {
  const srcRegex = /src\s*=\s*["']([^"']+)["']/gi;
  const urls = [];

  let match;
  while ((match = srcRegex.exec(str)) !== null) {
    if (match[1].startsWith('https://images.unsplash.com/photo')) {
      urls.push(match[1]);
    }
  }

  // Remove duplicates
  return Array.from(new Set(urls));
}

const imageUrls = extractSrcUrls(inputString);

// Write to JSON file
fs.writeFileSync('images.json', JSON.stringify(imageUrls, null, 2), 'utf-8');

console.log('Extracted src URLs starting with https://images.unsplash.com/photo saved to images.json'); 