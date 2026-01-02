# Deployment Checklist

Complete checklist for deploying GlamCart virtual try-on application.

## Pre-Deployment Setup

### MongoDB Atlas
- [ ] Create MongoDB Atlas account
- [ ] Create a cluster (recommend: M0 free tier for testing, M2 for production)
- [ ] Create database user (e.g., "glamcart")
- [ ] Whitelist IP address (0.0.0.0/0 for DigitalOcean or specific VM IP)
- [ ] Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/glamcart`
- [ ] Create "glamcart" database
- [ ] Create indexes for products and users collections

### DigitalOcean VM Setup
- [ ] Create Droplet (Ubuntu 22.04 LTS recommended, 2GB RAM minimum)
- [ ] Install Docker: `apt-get install docker.io docker-compose`
- [ ] Install Git: `apt-get install git`
- [ ] Set up firewall rules (ports: 80, 443, 8080)
- [ ] Install SSL certificate (Let's Encrypt): `apt-get install certbot`
- [ ] Configure reverse proxy (Nginx or similar)

### GitHub Configuration
- [ ] Create GitHub Secrets for CI/CD:
  - `DOCKERHUB_USERNAME` - Your Docker Hub username
  - `DOCKERHUB_ACCESS_TOKEN` - Docker Hub token (Settings > Security)
- [ ] Ensure backend Dockerfile is in `/backend` directory
- [ ] Verify GitHub Actions workflow in `.github/workflows/`

### Vercel Setup
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com`
  - `NEXT_PUBLIC_ENABLE_MEDIAPIPE=true`
- [ ] Set build command: `next build`
- [ ] Set start command: `next start`

## Backend Deployment

### Local Testing
- [ ] Copy `.env.example` to `.env` in backend directory
- [ ] Update environment variables with real values
- [ ] Install dependencies: `npm install`
- [ ] Test with: `npm run dev`
- [ ] Verify endpoints with `curl http://localhost:3001/api/products`

### Docker Build & Push
- [ ] Build Docker image: `docker build -t glamcart-backend:latest .`
- [ ] Test container locally:
  ```bash
  docker run -d \
    --name test-backend \
    -p 8080:8080 \
    -e PORT=8080 \
    -e MONGODB_URI=your-uri \
    -e JWT_SECRET=your-secret \
    glamcart-backend:latest
  ```
- [ ] Verify container is running: `docker logs test-backend`
- [ ] Clean up test container: `docker stop test-backend && docker rm test-backend`

### GitHub Actions Verification
- [ ] Push changes to `main` branch
- [ ] Monitor GitHub Actions workflow in repository
- [ ] Verify Docker image is built and pushed to Docker Hub
- [ ] Check Docker Hub repository for new tags (latest, and git SHA)

### DigitalOcean Deployment
- [ ] SSH into droplet: `ssh root@your-vm-ip`
- [ ] Create `.env` file with production values:
  ```
  PORT=8080
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=production-secret
  CORS_ORIGIN=https://your-vercel-domain.vercel.app
  NODE_ENV=production
  ```
- [ ] Pull Docker image: `docker pull your-dockerhub-user/glamcart-backend:latest`
- [ ] Run container:
  ```bash
  docker run -d \
    --restart=always \
    --name glamcart-backend \
    -p 127.0.0.1:8080:8080 \
    -e PORT=8080 \
    -e MONGODB_URI=mongodb+srv://... \
    -e JWT_SECRET=your-secret \
    -e CORS_ORIGIN=https://your-vercel-domain.vercel.app \
    your-dockerhub-user/glamcart-backend:latest
  ```
- [ ] Verify container is running: `docker logs glamcart-backend`
- [ ] Test API endpoint: `curl http://127.0.0.1:8080/api/products`

### SSL/HTTPS Configuration
- [ ] Obtain SSL certificate:
  ```bash
  certbot certonly --standalone -d api.yourdomain.com
  ```
- [ ] Configure Nginx reverse proxy to forward HTTPS → HTTP (container)
- [ ] Verify HTTPS works: `curl https://api.yourdomain.com/api/products`

## Frontend Deployment

### Local Testing
- [ ] Copy `.env.example` to `.env.local` in frontend directory
- [ ] Update `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` (for local testing)
- [ ] Install dependencies: `npm install`
- [ ] Test with: `npm run dev`
- [ ] Verify MediaPipe loads in DevTools Console (should see initialization message)
- [ ] Test image upload and try-on feature

### Vercel Deployment
- [ ] Commit changes to GitHub: `git push origin main`
- [ ] Monitor deployment in Vercel dashboard
- [ ] Verify build logs for any errors
- [ ] Test deployed site: `https://your-vercel-domain.vercel.app`

### Environment Variables Update (Post-Backend Deployment)
- [ ] Once backend is live on DigitalOcean, update Vercel settings:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`
- [ ] Trigger new Vercel deployment (or redeploy)
- [ ] Verify frontend can connect to live backend API

## Testing & Validation

### API Testing
- [ ] Test backend health: `GET https://api.yourdomain.com/api/products`
- [ ] Verify CORS headers in response
- [ ] Test with sample product data in MongoDB
- [ ] Test authentication endpoints (if applicable)

### Frontend Testing
- [ ] Load frontend: `https://your-vercel-domain.vercel.app`
- [ ] Check browser console for errors
- [ ] Verify MediaPipe Face Mesh initializes
- [ ] Test image upload (drag & drop and file input)
- [ ] Select a product color
- [ ] Click "Apply Makeup" and verify result
- [ ] Test on mobile (responsive design)
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### Performance Testing
- [ ] Check Lighthouse score in DevTools (aim for 85+)
- [ ] Test image processing speed (<500ms for typical image)
- [ ] Monitor network tab for API response times
- [ ] Check mobile performance (4G throttling in DevTools)

### Security Testing
- [ ] Verify no sensitive data in browser console
- [ ] Check environment variables are not exposed (`NEXT_PUBLIC_` prefix only)
- [ ] Verify HTTPS is enforced on production
- [ ] Test CORS restrictions (try accessing from different origin)

## Post-Deployment

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, New Relic, etc.)
- [ ] Monitor Docker container logs: `docker logs -f glamcart-backend`
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor database metrics on MongoDB Atlas

### Database Management
- [ ] Enable automatic backups on MongoDB Atlas
- [ ] Test restore procedure
- [ ] Create initial product data in MongoDB
- [ ] Document backup/restore procedures

### Documentation
- [ ] Update team on deployment status
- [ ] Create runbook for common operations
- [ ] Document secrets and where they're stored
- [ ] Update DNS records if using custom domain
- [ ] Share frontend URL and backend API URL with team

### Ongoing Maintenance
- [ ] Set up automatic Docker image updates
- [ ] Monitor Node.js version for updates
- [ ] Review MongoDB Atlas billing and usage
- [ ] Monitor Vercel bandwidth and usage
- [ ] Set up alerts for error rates and performance degradation

## Rollback Procedures

### Backend Rollback
```bash
# If new container has issues:
docker stop glamcart-backend
docker rm glamcart-backend

# Run previous image version
docker run -d \
  --restart=always \
  --name glamcart-backend \
  -p 127.0.0.1:8080:8080 \
  -e PORT=8080 \
  -e MONGODB_URI=... \
  -e JWT_SECRET=... \
  your-dockerhub-user/glamcart-backend:previous-sha
```

### Frontend Rollback
- [ ] Vercel dashboard > Deployments > Select previous version > Redeploy

### Database Rollback
- [ ] MongoDB Atlas > Backup & Restore > Restore from backup

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs glamcart-backend

# Check environment variables
docker inspect glamcart-backend | grep -A 20 Env

# Verify MongoDB connection
docker exec glamcart-backend node -e "require('mongoose').connect(process.env.MONGODB_URI)"
```

### Frontend can't connect to API
```bash
# Check CORS headers
curl -H "Origin: https://your-vercel-domain.vercel.app" https://api.yourdomain.com/api/products

# Check Vercel environment variables
# Verify NEXT_PUBLIC_API_BASE_URL is correct
```

### MediaPipe fails to load
```bash
# Check browser console for WASM loading errors
# Verify CDN is accessible: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm
# Clear browser cache and reload
```

## Sign-Off Checklist

- [ ] All environment variables configured
- [ ] Backend is running and responsive
- [ ] Frontend is deployed and accessible
- [ ] API endpoints are working
- [ ] MediaPipe face mesh is functioning
- [ ] Virtual try-on feature works end-to-end
- [ ] All tests pass
- [ ] No console errors in frontend
- [ ] Backend logs show healthy operation
- [ ] Database is accessible and populated
- [ ] SSL/HTTPS is working
- [ ] CORS is properly configured
- [ ] Monitoring and alerting is set up
- [ ] Team is trained on deployment procedures
- [ ] Documentation is complete and up-to-date

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: _______________
