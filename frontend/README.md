# Frontend – Glamcart Next.js Application

This directory contains the Glamcart frontend, a modern Next.js 15 application with React 19, Tailwind CSS, and AI-powered virtual try-on capabilities.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_BASE_URL

# Start development server
npm run dev
# Open http://localhost:9002
```

## Architecture

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with CartProvider
│   ├── page.tsx           # Home page (Server Component)
│   ├── products/
│   │   └── page.tsx       # Products listing (Server Component, fetches API)
│   ├── try-on/
│   │   └── page.tsx       # Virtual try-on (Client Component)
│   ├── cart/
│   │   └── page.tsx       # Shopping cart
│   ├── checkout/
│   │   └── page.tsx       # Checkout & order placement
│   └── backend/
│       └── page.tsx       # Architecture demo page
├── components/            # Reusable React components
│   ├── layout/           # Header, footer
│   ├── product/          # Product cards, filters, details
│   └── ui/               # Shadcn/Radix UI components
├── context/              # React Context for state
│   └── cart-context.tsx  # Shopping cart state management
├── hooks/                # Custom React hooks
├── lib/
│   ├── api.ts           # Centralized API utility (CORE)
│   ├── products.ts      # Product types & fetchProducts()
│   ├── placeholder-images.ts
│   └── utils.ts
├── ai/                   # Genkit AI flows
│   ├── flows/
│   │   ├── virtual-try-on-color-matching.ts
│   │   ├── personalized-product-recommendations.ts
│   │   └── service-layer.ts
│   ├── dev.ts
│   └── genkit.ts
└── globals.css          # Global Tailwind styles
```

### Component Types

**Server Components** (can fetch APIs internally):
- `src/app/page.tsx` – Home page with featured products
- `src/app/products/page.tsx` – Product listing
- These fetch from `NEXT_PUBLIC_API_BASE_URL`

**Client Components** (interactive features):
- `src/app/try-on/page.tsx` – Virtual try-on with file upload
- `src/app/cart/page.tsx` – Shopping cart management
- `src/app/checkout/page.tsx` – Order checkout
- `src/context/cart-context.tsx` – Cart state provider

## API Integration

### Centralized API Utility (`src/lib/api.ts`)

All HTTP requests use this utility for consistency:

```typescript
import { apiGet, apiPost } from '@/lib/api';

// GET request
const response = await apiGet<Product[]>('/api/products');
if (response.error) {
  console.error(response.error);
} else {
  const products = response.data;
}

// POST request
const result = await apiPost('/api/orders', {
  items: [...],
  shipping: {...}
});
```

### Server Component Example

```typescript
// src/app/products/page.tsx
import { fetchProducts } from '@/lib/products';

export default async function ProductsPage() {
  // Server-side fetch (runs on Vercel)
  const products = await fetchProducts();

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Client Component Example

```typescript
// src/app/try-on/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function TryOnPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Client-side fetch (in browser)
    const fetchLipsticks = async () => {
      const response = await apiGet('/api/products');
      if (response.data) {
        setProducts(response.data.filter(p => p.category === 'Lipstick'));
      }
    };
    
    fetchLipsticks();
  }, []);

  return <div>{/* UI */}</div>;
}
```

## Environment Variables

### Local Development (`.env.local`)
```env
# Backend API base URL (required)
# For local backend: http://localhost:3001
# For deployed backend: https://api.glamcart.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Vercel Production
Set in Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_BASE_URL = https://api.glamcart.com
```

## Backend API Endpoints Expected

The frontend expects these endpoints from the backend service:

```
GET /api/products              # All products
GET /api/products/:id          # Single product
POST /api/products/search      # Search products
GET /api/tryon/models          # Try-on model list
POST /api/tryon/apply          # Apply virtual makeup
GET /api/recommendations       # AI recommendations
POST /api/orders               # Place order
```

**Note:** Backend should implement these according to project specifications.

## Vercel Deployment

### Environment Setup
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
```

### Build & Start
```bash
npm run build    # Test production build locally
npm run start    # Start production server
```

### Deployment via GitHub
1. Push to GitHub main branch
2. Vercel automatically builds and deploys
3. View deployment at `https://your-project.vercel.app`

## Important Vercel Considerations

1. **Environment Variables at Build Time**
   - `NEXT_PUBLIC_` variables are injected during build
   - Must set before deploying to Vercel
   - Changes require rebuilding

2. **No Filesystem Access**
   - Cannot read/write files at runtime
   - Use external APIs for data persistence

3. **Timeout Limits**
   - Functions timeout after 60s (free tier)
   - Keep API calls fast, use caching

4. **CORS Headers**
   - Backend must allow requests from Vercel domain
   - Add to backend: `Access-Control-Allow-Origin: *` or specific domain

## Development Commands

```bash
# Start dev server (Turbopack)
npm run dev

# Start Genkit AI flows
npm run genkit:dev
npm run genkit:watch

# Production build
npm run build

# Start production server locally
npm run start

# Linting
npm run lint

# TypeScript checking
npm run typecheck
```

## Troubleshooting

### Products not loading
1. Check `NEXT_PUBLIC_API_BASE_URL` is set in `.env.local`
2. Verify backend is running: `curl http://localhost:3001/api/products`
3. Check browser console for network errors
4. Inspect Network tab in DevTools

### Build fails with errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

### Hydration mismatch errors
- Ensure Client Components have `'use client'` directive
- Check state initialization in useEffect
- Avoid rendering different content on server vs client

## Performance Tips

- Use `next/image` for optimized images
- Implement loading states for API calls
- Preload fonts in `layout.tsx`
- Use dynamic imports for heavy components
- Enable incremental static regeneration (ISR)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## UI Component Library

Uses shadcn/ui (Radix UI + Tailwind CSS):
- Button, Input, Card, Dialog, Tabs, etc.
- Located in `src/components/ui/`
- Customizable via Tailwind config

## State Management

- **Shopping Cart**: React Context + localStorage
- **Form State**: react-hook-form + Zod validation
- **UI State**: Local useState in components

## Styling

- **Framework**: Tailwind CSS
- **CSS-in-JS**: None (Tailwind classes only)
- **Config**: `tailwind.config.ts`
- **Globals**: `src/app/globals.css`

## Testing

```bash
# Run linting
npm run lint

# Type checking
npm run typecheck
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following Next.js/React best practices
3. Test locally: `npm run dev` and `npm run build`
4. Commit and push: `git push origin feature/your-feature`
5. Create pull request on GitHub

## Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel Docs](https://vercel.com/docs)

---

**Last Updated**: December 30, 2025  
**Frontend Ready**: ✅ Production-ready for Vercel  
**Backend Integration**: Awaiting backend team API implementation
