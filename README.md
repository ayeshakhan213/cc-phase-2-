# Glamcart – Virtual Try-On Makeup Application

## Description
Glamcart is a modern, full-stack e-commerce application for premium makeup brands with AI-powered virtual try-on capabilities. The frontend is a Next.js application deployed on Vercel, while the backend service runs on DigitalOcean with MongoDB Atlas for data storage, forming a complete three-tier cloud architecture.

This project demonstrates best practices in:
- Modern frontend development with Next.js 15 and React 19
- Server and Client Component architecture for Vercel compatibility
- API integration with centralized utility functions
- Clean separation of concerns (frontend UI only, no backend logic)
- Environment-based configuration for multi-environment deployments

## Tech Stack
- **Frontend**: Next.js 15 (TypeScript, React 19, Server/Client Components)
- **UI Framework**: Radix UI + Tailwind CSS
- **Frontend Hosting**: Vercel
- **Backend**: Node.js with Genkit AI (Docker, DigitalOcean VM)
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API (via Genkit)
- **Version Control**: Git & GitHub
- **API Communication**: RESTful with centralized fetch utility

## Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                  Presentation Tier (Vercel)                  │
│            Next.js Frontend + React Components               │
│  - Virtual Try-On UI (Client Component with Genkit flows)    │
│  - Product Listing (Server Component with API integration)   │
│  - Shopping Cart (Context API, localStorage)                 │
│  - Centralized API utility (src/lib/api.ts)                  │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTPS (NEXT_PUBLIC_API_BASE_URL)
┌───────────────▼──────────────────────────────────────────────┐
│               Application Tier (DigitalOcean VM)              │
│            Node.js Backend with Genkit AI Flows              │
│  - REST API endpoints (/api/products, /api/tryon, etc.)      │
│  - AI processing (Genkit flows for recommendations, etc.)    │
│  - Request validation & business logic                        │
└───────────────┬──────────────────────────────────────────────┘
                │ Connection String
┌───────────────▼──────────────────────────────────────────────┐
│                  Data Tier (MongoDB Atlas)                    │
│            Managed MongoDB Cloud Database                     │
│  - Product inventory                                          │
│  - User data & orders                                         │
│  - Try-on history & preferences                              │
└──────────────────────────────────────────────────────────────┘
```

## Frontend Setup & Deployment

### Prerequisites
- Node.js 20+ (recommended)
- npm or yarn package manager
- Git for version control

### Environment Configuration

The frontend requires a backend API URL to fetch products, makeup models, and other dynamic data. This is configured via the `NEXT_PUBLIC_API_BASE_URL` environment variable.

**Why `NEXT_PUBLIC_` prefix?**
- Vercel needs to inject environment variables at build time for the browser
- Client components cannot access secret environment variables (use `NEXT_PUBLIC_` prefix)
- Server components can use both `NEXT_PUBLIC_` and secret variables
- The backend URL is public information; it's safe to expose

**Environment Files:**
- `.env.local` – Local development (add to `.gitignore`)
- `.env.example` – Template for team members
- Vercel dashboard – Production environment variables

### Local Development

1. **Clone the repository and navigate to frontend:**
   ```bash
   git clone https://github.com/yourusername/glamcartapp.git
   cd glamcartapp/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and set `NEXT_PUBLIC_API_BASE_URL`:
     ```env
     # For local backend development:
     NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

     # For deployed backend:
     # NEXT_PUBLIC_API_BASE_URL=https://api.glamcart.com
     ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:9002`
   - Open in browser: http://localhost:9002

5. **Build for production:**
   ```bash
   npm run build
   ```
   - Tests the build process (same as Vercel)
   - Output: `.next/` directory

### Key Frontend Features

1. **Product Listing**
   - Server Component that fetches from backend API
   - Graceful fallback to local data if API unavailable
   - Real-time product filtering and search

2. **Virtual Try-On**
   - Client Component for image upload and makeup application
   - Uses Genkit AI flows (running on backend)
   - Fetches product data via centralized API utility

3. **Shopping Cart**
   - Client Component with Context API
   - Persists to browser's `localStorage`
   - No server-side session needed (Vercel compatible)

4. **Centralized API Integration**
   - `src/lib/api.ts` – All HTTP requests go through this utility
   - Consistent error handling and JSON parsing
   - Server Components: can use both internal and external APIs
   - Client Components: can only call external APIs (via NEXT_PUBLIC_API_BASE_URL)

### API Endpoints (Backend to Implement)

The frontend expects the following REST endpoints from the backend:

- `GET /api/products` – Fetch all products (lipsticks, eyeshadows, etc.)
- `GET /api/products/:id` – Fetch single product details
- `GET /api/tryon/models` – Fetch available try-on models/templates
- `POST /api/tryon/apply` – Apply virtual makeup to image (uses Genkit flow)
- `GET /api/recommendations` – Get AI-powered product recommendations

**Note:** These endpoints are placeholder paths. The backend service should implement them according to project requirements.

### Building & Testing

**Verify the build works locally:**
```bash
npm run build
npm run start
```
- Builds the project (same process as Vercel)
- Starts production server on `http://localhost:3000`

**Linting and type checking:**
```bash
npm run lint
npm run typecheck
```

## Vercel Deployment

### Prerequisites
- GitHub repository with this code
- Vercel account (free tier available)
- Backend deployed and accessible

### Steps to Deploy

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Set Environment Variables:**
   - In Vercel dashboard: Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_BASE_URL`:
     ```
     Name: NEXT_PUBLIC_API_BASE_URL
     Value: https://api.glamcart.com (or your backend URL)
     Environments: Production, Preview, Development
     ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Production URL: `https://your-project.vercel.app`

### Continuous Deployment

- Push to `main` branch → Automatic production deployment
- Push to other branches → Preview deployment (for testing)
- Environment variables are automatically injected at build time

## Code Quality & Best Practices

### No Node.js APIs in Client Components
- ✅ Safe: `useEffect`, `useState`, `fetch()`, `localStorage`
- ❌ Avoid: `fs.readFile()`, `require()`, `process.env` (without NEXT_PUBLIC_)

### Server vs Client Components
- **Server Components**: Fetch data, connect to databases, use secrets
- **Client Components**: User interactions, state management, real-time features

### API Error Handling
- Centralized utility gracefully handles network errors
- Fallback to local data if backend unavailable
- User-friendly error messages in UI

## Team Responsibilities & Structure

### Frontend Team
- **Component Development**: UI components in `src/components/`
- **Pages & Routing**: In `src/app/` following Next.js App Router
- **State Management**: Cart context in `src/context/`
- **API Integration**: Centralized in `src/lib/api.ts`

### Backend Team
- **REST API**: Implement endpoints expected by frontend
- **Database**: MongoDB with Mongoose or similar
- **Genkit Flows**: AI processing (recommendations, virtual try-on)
- **Docker**: Containerize backend for DigitalOcean deployment

### DevOps/Infrastructure
- **Backend Deployment**: DigitalOcean VM, Docker, MongoDB Atlas connection
- **CI/CD**: GitHub Actions for automated testing & deployment
- **Monitoring**: Set up logging and error tracking

## Important Notes for Vercel Compatibility

1. **No Filesystem Writes**: Backend APIs must handle data persistence
2. **Serverless Functions**: Backend should be stateless or use external databases
3. **Build Time Environment**: Set `NEXT_PUBLIC_` variables before build
4. **CORS Handling**: Backend must allow requests from Vercel domain
5. **Cold Starts**: Backend APIs may have brief delays after inactivity

## Troubleshooting

### "NEXT_PUBLIC_API_BASE_URL not configured" Warning
- Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Restart dev server: `npm run dev`

### Backend API calls failing
- Verify backend is running: `curl http://localhost:3001/api/products`
- Check `NEXT_PUBLIC_API_BASE_URL` matches backend address
- Ensure backend allows CORS requests

### Products not loading (fallback to local data)
- Check browser console for network errors
- Verify backend `/api/products` endpoint returns valid JSON
- Inspect network tab in DevTools

## Repository Structure

```
glamcartapp/
├── frontend/                # This Next.js application
│   ├── src/
│   │   ├── app/            # Next.js App Router pages & layouts
│   │   ├── components/     # React components (UI, product, layout)
│   │   ├── context/        # State management (cart context)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts      # Centralized API utility
│   │   │   ├── products.ts # Product types & fetch function
│   │   │   └── utils.ts    # Utility functions
│   │   └── ai/             # Genkit AI flows
│   ├── .env.example        # Environment template
│   ├── .env.local          # (Local only, .gitignore)
│   ├── next.config.ts      # Next.js configuration
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vercel.json         # Vercel deployment config
│   └── package.json        # Dependencies
├── backend/                # Separate backend service
└── database/               # Database configuration files
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run genkit:dev       # Start Genkit AI flows in dev mode
npm run genkit:watch     # Watch Genkit files for changes

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Check TypeScript types

# Deployment
# Vercel: Connected via GitHub, auto-deploys on git push
# Local: npm run build && npm run start
```

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips
- Images are optimized with Next.js Image component
- Unused CSS is purged with Tailwind CSS
- Server Components reduce JavaScript shipped to browser
- Dynamic imports for heavy components

## License
Open Source (MIT)

## Contact & Support
For issues or questions:
1. Check GitHub Issues
2. Review frontend documentation in `frontend/docs/`
3. Contact the frontend team lead

---

**Last Updated**: December 30, 2025  
**Vercel Deployment Status**: Ready for production  
**Backend Integration**: API endpoints to be implemented by backend team
