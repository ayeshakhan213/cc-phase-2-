import { Suspense } from 'react';
import { products } from '@/lib/products';
import { ProductFilters } from '@/components/product/product-filters';

export const metadata = {
  title: 'All Products | Glamify',
  description: 'Explore our curated collection of premium lipsticks and eyeshadows from top brands.',
};

/**
 * Server Component that displays products.
 * 
 * Data Flow:
 * - Uses local product data for build-time rendering (avoids API calls at build)
 * - Product filters are client-side and support dynamic API fetching if needed
 * - Backend API integration: Can be added via a Client Component wrapper if needed
 * 
 * Vercel Compatibility:
 * - Uses static data during build (avoids external API dependency)
 * - No API calls during server-side rendering (build time)
 * - ProductFilters Client Component handles search params and filtering
 */
export default function ProductsPage() {
  // Use local data for initial render to avoid API calls during build
  // In production, ProductFilters can fetch from backend if NEXT_PUBLIC_API_BASE_URL is set
  const allProducts = products;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Product Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Only the best, 4+ star rated products from world-class brands.</p>
      </div>
      <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
      <ProductFilters allProducts={allProducts} />
      </Suspense>
    </div>
  );
}

