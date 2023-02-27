const fs = require('fs');
const path = require('path');

const reviewsDir = path.join(__dirname, 'aclImdb', 'train');
const reviewFiles = fs.readdirSync(reviewsDir);

const reviews = reviewFiles.map(file => {
  const filePath = path.join(reviewsDir, file);
  const text = fs.readFileSync(filePath, 'utf-8');
  const label = /pos/.test(file) ? 1 : 0; // 1 for positive reviews, 0 for negative reviews
  return { text, label };
});

fs.writeFileSync('reviews.json', JSON.stringify(reviews));
