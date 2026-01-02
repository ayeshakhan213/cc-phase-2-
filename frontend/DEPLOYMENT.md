# Virtual Try-On Frontend - Vercel Deployment Guide

This is a Next.js frontend for the GlamCart virtual makeup try-on application with MediaPipe face mesh integration.

## Architecture

- **Frontend**: Next.js 15 (Vercel-ready, TypeScript)
- **Backend**: Express.js on DigitalOcean VM (MongoDB Atlas)
- **Face Detection**: MediaPipe Face Mesh for accurate lipstick application
- **Image Processing**: Canvas-based blending with color adjustment

## Setup

### Local Development

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
# Copy template
cp .env.example .env.local

# Update with your backend URL (default: http://localhost:3001)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. **Run development server**:
```bash
npm run dev
```
Access at `http://localhost:9002`

### Production Deployment (Vercel)

1. **Connect repository** to Vercel dashboard

2. **Configure environment variables** in Vercel settings:
```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_ENABLE_MEDIAPIPE=true
```

3. **Deploy**:
```bash
git push origin main
```

## API Integration

The frontend communicates with the backend via the `NEXT_PUBLIC_API_BASE_URL` environment variable.

### Endpoints Used

- `GET /api/products` - Fetch makeup products (lipsticks, eyeshadows)
- `POST /api/tryon/apply` - Apply virtual makeup (optional backend processing)

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | http://localhost:3001 |
| `NEXT_PUBLIC_ENABLE_MEDIAPIPE` | Enable MediaPipe face mesh | true |

## Features

### Virtual Lipstick with MediaPipe
- Uses Google's MediaPipe Face Mesh for 478 facial landmarks
- Detects lip region with 85% blend factor for natural appearance
- Fallback to color-based detection if MediaPipe initialization fails

### Product Integration
- Fetches makeup products from backend API
- Supports Lipstick and Eyeshadow categories
- Graceful degradation if API is unavailable

### Image Processing
- Real-time canvas-based color application
- 4MB file size limit for security
- Supports PNG and JPEG formats

## Browser Support

- Chrome/Chromium 90+
- Firefox 90+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Development

### MediaPipe Utilities
Located in `src/lib/mediapipe-utils.ts`:
- `initializeFaceLandmarker()` - Initialize MediaPipe with WASM backend
- `detectLipRegion()` - Get lip region bounds from image
- `applyLipstickWithMediaPipe()` - Apply color to detected lip region
- `cleanup()` - Release MediaPipe resources

### Try-On Component
Located in `src/app/try-on/page.tsx`:
- Client component with React hooks
- Responsive grid layout (3-column on desktop, 1-column on mobile)
- Before/after image comparison
- Product selection sidebar with color swatches

## Performance

- **MediaPipe Model**: ~240 KB (CDN-hosted)
- **First Load**: ~2-3 seconds on 4G
- **Image Processing**: <500ms for 512x512 image
- **Memory**: ~50-80 MB with loaded model

## Troubleshooting

### MediaPipe Fails to Initialize
- Check browser console for WASM loading errors
- Ensure `NEXT_PUBLIC_ENABLE_MEDIAPIPE=true` in environment
- Verify CORS headers from CDN

### API Connection Errors
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check backend is running and accessible
- Enable CORS on backend if running on different domain

### Image Upload Issues
- Maximum 4MB file size
- Supported formats: PNG, JPEG
- Clear browser cache and retry

## Security Considerations

- **Image Processing**: All processing is client-side, images are not sent to backend
- **Environment Variables**: All prefixed with `NEXT_PUBLIC_` for client-side access only
- **CORS**: Backend must allow requests from Vercel domain
- **Input Validation**: File size and format checks before processing

## Related Documentation

- [Backend Setup Guide](../backend/README.md)
- [MediaPipe Face Mesh Docs](https://developers.google.com/mediapipe/solutions/vision/face_landmarker)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
