# Authentication Setup with MongoDB Atlas

## Step-by-Step Setup Guide

### Phase 1: MongoDB Atlas Cluster Setup

#### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project called "GlamCart"

#### 1.2 Create a Cluster
1. Click "Create a Deployment"
2. Choose **M0 Free Tier** for development
3. Select cloud provider: **AWS**
4. Select region: Choose closest to you (e.g., us-east-1)
5. Click "Create Cluster" and wait for provisioning (5-10 minutes)

#### 1.3 Create Database User
1. In cluster, go to **Database Access**
2. Click "Add New Database User"
3. Authentication: **Password**
4. Username: `glamcart`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Atlas Admin**
7. Click "Add User"

**Save these credentials!**
```
Username: glamcart
Password: [your-generated-password]
```

#### 1.4 Configure Network Access
1. Go to **Network Access**
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production: Add specific DigitalOcean VM IP
4. Click "Confirm"

#### 1.5 Get Connection String
1. Go to **Databases** → Your Cluster
2. Click "Connect"
3. Choose "Drivers"
4. Select **Node.js** driver
5. Copy the connection string:
```
mongodb+srv://glamcart:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<password>` with your actual password (not the placeholder).

---

### Phase 2: Backend Configuration

#### 2.1 Update Backend .env File

Create `.env` in `backend/` folder:
```
# Server
PORT=3001
NODE_ENV=development

# MongoDB Atlas (replace values)
MONGODB_URI=mongodb+srv://glamcart:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/glamcart?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-this

# CORS
CORS_ORIGIN=http://localhost:9002

# Optional: AI Integration
GEMINI_API_KEY=your-api-key-optional
```

#### 2.2 Verify Backend Dependencies
```bash
cd backend
npm install
```

**Key packages already installed:**
- ✅ mongoose (MongoDB ODM)
- ✅ jsonwebtoken (JWT)
- ✅ bcryptjs (Password hashing)
- ✅ express (Server)
- ✅ cors (Cross-origin)
- ✅ dotenv (Environment variables)

#### 2.3 Database Schema (Already Configured)

**User Model** (`backend/models/User.js`):
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  phone: String,
  skinType: String (enum: ['oily', 'dry', 'combination', 'sensitive', 'normal']),
  preferredColors: [String],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### Phase 3: Authentication Routes (Backend)

#### 3.1 Available Endpoints

**`POST /api/auth/register`**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "skinType": "oily"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**`POST /api/auth/login`**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**`GET /api/auth/profile`** (Requires JWT Token)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Phase 4: Frontend Integration

#### 4.1 Update Frontend .env.local

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_MEDIAPIPE=true
```

#### 4.2 API Client Already Configured

**File**: `frontend/src/lib/api.ts`

```typescript
// Ready to use:
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>>
export async function apiPost<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>>
export async function apiPut<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>>
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>>
export async function apiPatch<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>>
```

#### 4.3 Example: Register/Login Components

Create a login component:
```typescript
// frontend/src/components/auth/LoginForm.tsx
import { apiPost } from '@/lib/api';

export function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    const response = await apiPost('/api/auth/login', { email, password });
    
    if (response.data) {
      // Store token in localStorage or secure cookie
      localStorage.setItem('token', response.data.token);
      // Redirect to dashboard
    } else {
      console.error(response.error);
    }
  };
}
```

---

### Phase 5: Testing

#### 5.1 Local Development Test

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output: Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Output: Server running on localhost:9002
```

#### 5.2 Test MongoDB Connection

```bash
# In backend terminal, you should see:
# MongoDB connected successfully: mongodb+srv://glamcart@cluster0.xxxxx.mongodb.net
```

#### 5.3 Test Authentication Endpoints

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Check profile
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Phase 6: Production Preparation

#### 6.1 MongoDB Atlas Production Setup

1. **Upgrade Cluster** (M2 or higher for production)
2. **Enable Encryption** in cluster settings
3. **Set up Backup** (automatic daily backups)
4. **Configure IP Whitelist** with DigitalOcean VM IP only
5. **Enable Database Audit** for production

#### 6.2 DigitalOcean VM Setup

1. Create droplet
2. Add MongoDB connection string to `.env`
3. Set `JWT_SECRET` to strong 32+ character string
4. Set `NODE_ENV=production`
5. Set `CORS_ORIGIN=https://your-vercel-domain.vercel.app`

#### 6.3 Vercel Frontend Setup

1. Connect GitHub repository
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
   NEXT_PUBLIC_ENABLE_MEDIAPIPE=true
   ```
3. Deploy

---

## Checklist

### Before Starting Backend
- [ ] Created MongoDB Atlas account
- [ ] Created M0 free cluster
- [ ] Created database user (glamcart)
- [ ] Got connection string with password
- [ ] Created `.env` file in backend/
- [ ] Added MONGODB_URI to .env
- [ ] Added JWT_SECRET to .env

### Before Testing
- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] Both have correct API_BASE_URL
- [ ] MongoDB connection string is valid
- [ ] JWT_SECRET is set (min 32 chars for production)

### Before Production
- [ ] Verified all auth endpoints work
- [ ] User registration creates hashed passwords
- [ ] Login returns valid JWT token
- [ ] Protected routes require token
- [ ] CORS configured correctly
- [ ] Database user has restricted permissions
- [ ] Backups enabled on MongoDB Atlas

---

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ENOTFOUND cluster0.xxxxx.mongodb.net
```
**Solution**: 
- Verify connection string format
- Check password doesn't have special characters (URL encode if needed)
- Verify IP whitelist includes your IP (0.0.0.0/0 for dev)

### JWT Token Invalid
```
Error: invalid signature
```
**Solution**:
- Check JWT_SECRET matches between auth generation and verification
- Use same JWT_SECRET in production

### CORS Errors in Frontend
```
Error: Access to XMLHttpRequest blocked by CORS
```
**Solution**:
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Restart backend after changing .env

### Password Hash Issues
```
Error: comparing hash against incomplete data
```
**Solution**:
- Ensure bcryptjs is installed: `npm install bcryptjs`
- Check User.js pre-save hook is correctly implemented

---

## Next Steps

1. ✅ Complete MongoDB Atlas setup (Phase 1-2)
2. ✅ Start backend with `npm run dev` (Phase 3)
3. ✅ Test auth endpoints with curl (Phase 5)
4. ✅ Create login UI component in frontend
5. ✅ Test login flow end-to-end
6. ✅ Add protected routes (need token)
7. ✅ Deploy to production

---

**Status**: Ready for implementation  
**Time to complete**: ~30 minutes  
**Difficulty**: Moderate
