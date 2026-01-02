# Quick Start Guide

## Project Structure
```
Two clean folders only:
- frontend/       → Vercel deployment (UI only)
- backend/        → DigitalOcean Docker (API + Database + CI/CD)
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:9002
```

**Features**:
- MediaPipe Face Mesh for virtual lipstick
- Next.js 15 + React 19
- TailwindCSS UI
- Environment: `.env.local` (dev) or `.env.production` (Vercel)

## Backend Setup
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

**Includes**:
- Express.js REST API
- MongoDB Atlas integration
- Docker containerization
- GitHub Actions CI/CD
- Database setup (docker-compose.db.yml)
- JWT authentication

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_MEDIAPIPE=true
```

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/glamcart
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:9002
NODE_ENV=development
```

## Deployment

### Frontend → Vercel
1. Connect GitHub repository
2. Set environment: `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`
3. Deploy: Auto-deploys on `main` branch

### Backend → DigitalOcean
1. Build Docker image: `docker build -t glamcart-backend .`
2. Push to Docker Hub (via GitHub Actions)
3. Deploy to VM: `docker run -d ... glamcart-backend:latest`

## Key Technologies

### Frontend
- Next.js 15 (TypeScript)
- MediaPipe (478 facial landmarks)
- Canvas API (image processing)
- TailwindCSS + Radix UI

### Backend
- Express.js
- MongoDB Atlas
- Docker
- GitHub Actions
- JWT + bcryptjs

## Documentation

- `frontend/DEPLOYMENT.md` - Frontend guide
- `backend/DEPLOYMENT.md` - Backend guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment
- `README.md` - Project overview

## Verification

✅ Root has only: frontend/, backend/, docs, .git
✅ Frontend has Next.js structure + .env files
✅ Backend has Express.js structure + Dockerfile + CI/CD
✅ No dependencies conflict between frontend and backend
✅ MediaPipe integrated in frontend
✅ Database and CI/CD in backend

## Production Checklist

- [ ] Create MongoDB Atlas account
- [ ] Configure GitHub Secrets (DOCKERHUB_USERNAME, DOCKERHUB_ACCESS_TOKEN)
- [ ] Set up DigitalOcean droplet
- [ ] Configure Vercel environment variables
- [ ] Test backend API endpoints
- [ ] Test frontend with live backend
- [ ] Deploy and monitor

---

**Version**: 1.0.0
**Status**: Ready for deployment
**Last Updated**: January 1, 2026
