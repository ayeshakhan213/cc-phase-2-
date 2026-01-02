# GlamCart Backend - DigitalOcean VM Deployment

Express.js backend for the virtual makeup try-on application with MongoDB Atlas integration.

## Architecture

- **Runtime**: Node.js 20+ (Alpine Linux via Docker)
- **Framework**: Express.js with CORS enabled
- **Database**: MongoDB Atlas (Cloud)
- **Deployment**: Docker containerized on DigitalOcean VM
- **Authentication**: JWT tokens
- **API**: RESTful endpoints for products and user management

## Project Structure

```
backend/
├── .github/workflows/          # GitHub Actions CI/CD
│   └── backend-docker-publish.yml
├── models/                     # Mongoose schemas
│   └── User.js
├── routes/                     # API endpoints
│   └── auth.js
├── Dockerfile                  # Docker image config
├── docker-compose.db.yml       # Database setup
├── package.json               # Dependencies
├── index.js                   # Server entry point
├── products.js               # Product data/routes
└── genkit.js                # AI integration
```

## Quick Start

### Local Development

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment** (`.env`):
```
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/glamcart
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

3. **Run server**:
```bash
npm run dev
```
Server starts at `http://localhost:3001`

### Docker Deployment (DigitalOcean VM)

1. **Build image**:
```bash
docker build -t glamcart-backend:latest .
```

2. **Run container**:
```bash
docker run -d \
  --name glamcart-backend \
  -p 8080:8080 \
  -e PORT=8080 \
  -e MONGODB_URI=mongodb+srv://... \
  -e JWT_SECRET=your-secret \
  glamcart-backend:latest
```

3. **Access API**:
```
https://your-vm-ip.com:8080
```

## API Endpoints

### Products
- `GET /api/products` - List all makeup products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user (requires JWT)

### Try-On (Optional)
- `POST /api/tryon/apply` - Apply makeup effects (backend processing)
- `GET /api/tryon/history` - Get user's saved try-ons (requires JWT)

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `NODE_ENV` | Environment mode | No (default: development) |
| `CORS_ORIGIN` | Frontend domain for CORS | Yes |

### Example `.env.production`
```
PORT=8080
MONGODB_URI=mongodb+srv://glamcart:password@cluster.mongodb.net/glamcart
JWT_SECRET=super-secret-production-key
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

## MongoDB Atlas Setup

1. **Create cluster** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create database user** with username/password
3. **Whitelist IP** (0.0.0.0/0 for DigitalOcean or restrict to your VM IP)
4. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/glamcart
   ```

## CI/CD with GitHub Actions

The workflow automatically:
1. Builds Docker image on every push to `main` (in `backend/` path)
2. Pushes to Docker Hub with tags: `latest` and git SHA
3. Supports both `linux/amd64` and `linux/arm64` architectures

### Setup:

1. **Configure GitHub Secrets**:
   - `DOCKERHUB_USERNAME` - Your Docker Hub username
   - `DOCKERHUB_ACCESS_TOKEN` - Docker Hub access token

2. **Configure Vercel/DigitalOcean** to pull and run latest image

## Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  name: String,
  createdAt: Date,
  savedTryOns: [ObjectId] // References to try-on results
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  category: String, // "Lipstick", "Eyeshadow", etc.
  colors: [{
    name: String,
    hex: String // "#FF0000"
  }],
  description: String,
  price: Number,
  image: String, // URL
  createdAt: Date
}
```

## CORS Configuration

Ensure frontend domain is whitelisted:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:9002',
  credentials: true
}));
```

## Database Management

### Backup
```bash
mongodump --uri "mongodb+srv://..." --out ./backup
```

### Restore
```bash
mongorestore --uri "mongodb+srv://..." ./backup
```

## Monitoring

### Health Check Endpoint
```bash
curl https://your-vm-ip.com/health
```

### Docker Logs
```bash
docker logs -f glamcart-backend
```

### MongoDB Connection Test
```bash
mongo "mongodb+srv://username:password@cluster.mongodb.net/glamcart"
```

## Security

1. **JWT Authentication**: All user endpoints require valid JWT token
2. **Password Hashing**: bcryptjs for password storage
3. **CORS**: Restrict to frontend domain
4. **Rate Limiting**: Implement for production
5. **HTTPS**: Use SSL certificate on VM (Let's Encrypt recommended)
6. **Environment Secrets**: Never commit `.env` files, use CI/CD secrets

## Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Docker image builds successfully
- [ ] GitHub Secrets configured (DOCKERHUB_USERNAME, DOCKERHUB_ACCESS_TOKEN)
- [ ] Environment variables set on DigitalOcean VM
- [ ] CORS_ORIGIN includes frontend Vercel domain
- [ ] SSL certificate installed (HTTPS)
- [ ] Health check endpoint working
- [ ] Database connection tested
- [ ] API endpoints tested with sample requests

## Troubleshooting

### Docker Image Won't Build
- Check `Dockerfile` paths and Node version
- Ensure `package.json` and `package-lock.json` exist

### MongoDB Connection Failed
- Verify connection string syntax
- Check IP whitelist on MongoDB Atlas
- Test with `mongo` CLI tool

### CORS Errors
- Verify `CORS_ORIGIN` env var matches frontend domain
- Check if frontend is making requests to correct API URL

### Container Exits
- Check logs: `docker logs container-id`
- Verify PORT environment variable
- Ensure MongoDB connection is valid

## Production Recommendations

1. **Load Balancing**: Use DigitalOcean Load Balancer
2. **Database Backups**: Enable automatic backups on MongoDB Atlas
3. **Monitoring**: Set up uptime monitoring (UptimeRobot, etc.)
4. **Logging**: Implement centralized logging (Datadog, New Relic)
5. **API Versioning**: Use `/api/v1/` endpoint prefix
6. **Validation**: Implement request validation middleware

## Related Documentation

- [Frontend Deployment](../frontend/DEPLOYMENT.md)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
