const PlaceHolderImagesRaw = require('../frontend/src/lib/placeholder-images.json');
// The JSON file exports an object with a `placeholderImages` array.
const PlaceHolderImages = Array.isArray(PlaceHolderImagesRaw)
  ? PlaceHolderImagesRaw
  : PlaceHolderImagesRaw?.placeholderImages || [];

const findImage = (id) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return {
    imageUrl: img?.imageUrl || 'https://picsum.photos/seed/default/800/800',
    imageHint: img?.imageHint || 'product photo',
  };
};

const products = [
  {
    id: '1',
    name: 'Rouge Pur Couture Lipstick',
    brand: 'YSL',
    category: 'Lipstick',
    price: 45.0,
    description: 'A rich and creamy lipstick that delivers incredible color payoff and feels hydrating and comfortable on the lips.',
    colors: [
      { name: 'Le Rouge', hex: '#C70039' },
      { name: 'Rose Stiletto', hex: '#AB274F' },
      { name: 'Nude Muse', hex: '#C49A8F' },
    ],
    rating: 4.8,
    reviewCount: 1250,
    ...findImage('ysl-lipstick-1'),
  },
  {
    id: '2',
    name: 'Addict Shine Lipstick',
    brand: 'Dior',
    category: 'Lipstick',
    price: 43.0,
    description: 'An ultra-glossy lipstick that offers 24 hours of hydration and 6 hours of vibrant, radiant color.',
    colors: [
      { name: 'Be Dior', hex: '#C21E56' },
      { name: 'Dior 8', hex: '#A43A3A' },
      { name: 'Nude Look', hex: '#D2B48C' },
    ],
    rating: 4.9,
    reviewCount: 2340,
    ...findImage('dior-lipstick-1'),
  },
  // ... include a subset for brevity; more products can be copied from frontend/src/lib/products.ts
];

module.exports = { products };
