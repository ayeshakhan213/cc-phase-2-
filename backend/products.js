const PlaceHolderImages = require('./data/placeholder-images.json');

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
  } ]
