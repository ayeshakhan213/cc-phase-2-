/**
 * Product data types and utilities for the glamcart frontend.
 *
 * API Integration:
 * - Backend endpoint: GET /api/products (to be implemented by backend service)
 * - NEXT_PUBLIC_API_BASE_URL environment variable controls API location
 * - Vercel-compatible: Uses NEXT_PUBLIC_ prefix to expose variables at build time
 */

import { PlaceHolderImages } from './placeholder-images';

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  brand: 'YSL' | 'Dior' | 'Giorgio Armani' | 'Charlotte Tilbury';
  category: 'Lipstick' | 'Eyeshadow';
  price: number;
  description: string;
  colors: ProductColor[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  imageHint: string;
};

const findImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return {
    imageUrl: img?.imageUrl || 'https://picsum.photos/seed/default/800/800',
    imageHint: img?.imageHint || 'product photo',
  };
};

export const products: Product[] = [
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
  {
    id: '3',
    name: 'Lip Power Satin Lipstick',
    brand: 'Giorgio Armani',
    category: 'Lipstick',
    price: 42.0,
    description: 'A long-lasting, comfortable satin lipstick with a unique drop-shaped bullet for precise application.',
    colors: [
      { name: 'Four Hundred', hex: '#BF0021' },
      { name: 'Androgino', hex: '#D29B9B' },
      { name: 'Selfless', hex: '#C47474' },
    ],
    rating: 4.7,
    reviewCount: 980,
    ...findImage('armani-lipstick-1'),
  },
  {
    id: '4',
    name: 'Matte Revolution Lipstick',
    brand: 'Charlotte Tilbury',
    category: 'Lipstick',
    price: 35.0,
    description: 'A matte lipstick that creates the illusion of fuller, wider lips with a soft, cashmere-like finish.',
    colors: [
      { name: 'Pillow Talk', hex: '#B97C7C' },
      { name: 'Walk of No Shame', hex: '#944848' },
      { name: 'Very Victoria', hex: '#A1736A' },
    ],
    rating: 4.9,
    reviewCount: 5432,
    ...findImage('ct-lipstick-1'),
  },
  {
    id: '5',
    name: 'Couture Mini Clutch Eyeshadow',
    brand: 'YSL',
    category: 'Eyeshadow',
    price: 68.0,
    description: 'A palette of four intense, blendable eyeshadows with a couture-inspired finish.',
    colors: [
      { name: 'Stora Dolls', hex: '#D8BFD8' },
      { name: 'Kasbah Spices', hex: '#D2691E' },
    ],
    rating: 4.6,
    reviewCount: 560,
    ...findImage('ysl-eyeshadow-1'),
  },
  {
    id: '6',
    name: '5 Couleurs Couture Eyeshadow',
    brand: 'Dior',
    category: 'Eyeshadow',
    price: 65.0,
    description: 'A long-wearing eyeshadow palette with a creamy, comfortable texture for expressive eye looks.',
    colors: [
      { name: 'Nude Dress', hex: '#DEB887' },
      { name: 'Poncho', hex: '#6D4C41' },
    ],
    rating: 4.8,
    reviewCount: 1890,
    ...findImage('dior-eyeshadow-1'),
  },
  {
    id: '7',
    name: 'Eye Tint Liquid Eyeshadow',
    brand: 'Giorgio Armani',
    category: 'Eyeshadow',
    price: 36.0,
    description: 'A long-lasting liquid eyeshadow that provides a crease-proof, vibrant wash of color.',
    colors: [
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Cold Copper', hex: '#B87333' },
    ],
    rating: 4.5,
    reviewCount: 750,
    ...findImage('armani-eyeshadow-1'),
  },
  {
    id: '8',
    name: 'Luxury Eyeshadow Palette',
    brand: 'Charlotte Tilbury',
    category: 'Eyeshadow',
    price: 55.0,
    description: 'A four-step eyeshadow quad with buildable, non-creasing formulas for day-to-night looks.',
    colors: [
      { name: 'Pillow Talk', hex: '#DEC4C4' },
      { name: 'The Bella Sofia', hex: '#8B4513' },
    ],
    rating: 4.9,
    reviewCount: 3120,
    ...findImage('ct-eyeshadow-1'),
  },
  {
    id: '9',
    name: 'The Bold High Pigment Lipstick',
    brand: 'YSL',
    category: 'Lipstick',
    price: 45.0,
    description: 'A lipstick that provides bold, intense color with a satin finish that lasts all day.',
    colors: [
        { name: 'Fearless Red', hex: '#FF2400' },
        { name: 'Nu Incongru', hex: '#D3A18E' },
        { name: 'Rebellious Nude', hex: '#C18579' }
    ],
    rating: 4.7,
    reviewCount: 890,
    ...findImage('ysl-lipstick-2')
  },
  {
    id: '10',
    name: 'Rouge Dior Forever Lipstick',
    brand: 'Dior',
    category: 'Lipstick',
    price: 46.0,
    description: 'A transfer-proof lipstick with an ultra-pigmented, matte finish and 16 hours of comfortable wear.',
    colors: [
        { name: '999 Forever Dior', hex: '#E51A2C' },
        { name: '100 Forever Nude', hex: '#CC9D8E' },
        { name: '720 Forever Icone', hex: '#B05961' }
    ],
    rating: 4.6,
    reviewCount: 1500,
    ...findImage('dior-lipstick-2')
  },
  {
    id: '11',
    name: 'Eyes to Mesmerise Cream',
    brand: 'Charlotte Tilbury',
    category: 'Eyeshadow',
    price: 35.0,
    description: 'A clever cream-to-sheen eyeshadow that creates maximum impact with minimum effort.',
    colors: [
        { name: 'Champagne', hex: '#F7E7CE' },
        { name: 'Rose Gold', hex: '#E0BFB8' },
        { name: 'Oyster Pearl', hex: '#AFA49A' }
    ],
    rating: 4.8,
    reviewCount: 2100,
    ...findImage('ct-eyeshadow-2')
  }
];

export const brands = [...new Set(products.map(p => p.brand))];
export const categories = [...new Set(products.map(p => p.category))];

/**
 * Fetches products from the backend API.
 * Falls back to local data if API is unavailable.
 *
 * Backend endpoint: GET /api/products
 * Expected response: { data: Product[] } or { error: string }
 *
 * This function is server-safe and can be called from Server Components
 * or async client-side functions (e.g., in useEffect).
 *
 * Vercel Compatibility:
 * - Uses NEXT_PUBLIC_API_BASE_URL set at build/deployment time
 * - No Node.js-specific code; compatible with serverless functions
 * - Graceful fallback for development or backend unavailability
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Use centralized API utility to fetch from backend
    // Requires process.env.NEXT_PUBLIC_API_BASE_URL to be set
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      console.warn(
        'NEXT_PUBLIC_API_BASE_URL not configured. Using local product data. ' +
        'Set NEXT_PUBLIC_API_BASE_URL in .env.local for backend integration.'
      );
      return products;
    }

    const response = await fetch(`${apiBaseUrl}/api/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache: use default (revalidate on each request for fresh data)
      // For static generation, set: cache: 'force-cache'
      // For ISR (Incremental Static Regeneration), add: next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const { data } = await response.json();

    if (Array.isArray(data)) {
      return data;
    }

    console.warn('Unexpected API response format. Using local product data.');
    return products;
  } catch (error) {
    console.error(
      'Failed to fetch products from backend API:',
      error instanceof Error ? error.message : error
    );
    // Graceful fallback to local data
    return products;
  }
}
