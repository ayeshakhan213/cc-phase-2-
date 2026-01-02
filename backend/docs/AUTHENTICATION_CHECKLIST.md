# Authentication Implementation Checklist

Complete step-by-step checklist for implementing MongoDB Atlas authentication in your project.

---

## Phase 1: MongoDB Atlas Setup (30 mins)

- [ ] Create MongoDB account at mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Create database user `glamcart` with password
- [ ] Whitelist IP (0.0.0.0/0 for dev)
- [ ] Copy connection string (save with password)
  - Example: `mongodb+srv://glamcart:PASSWORD@cluster0.xxxxx.mongodb.net/glamcart?retryWrites=true&w=majority`

---

## Phase 2: Backend Environment Configuration (10 mins)

### 2.1 Create `.env` File

Create `backend/.env` with these values:
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://glamcart:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/glamcart?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-minimum-32-characters-long-change-this
CORS_ORIGIN=http://localhost:9002
```

### 2.2 Verify Backend Files
- [x] ✅ `backend/models/User.js` - User schema with bcryptjs
- [x] ✅ `backend/routes/auth.js` - Auth routes (register, login, profile, update)
- [x] ✅ `backend/index.js` - Express server with MongoDB connection
- [x] ✅ `backend/package.json` - All auth packages installed

---

## Phase 3: Frontend Environment Configuration (5 mins)

### 3.1 Update `frontend/.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_MEDIAPIPE=true
```

### 3.2 Verify Frontend API Client
- [x] ✅ `frontend/src/lib/api.ts` - Generic API wrapper ready

---

## Phase 4: Implement Frontend Authentication (60 mins)

### 4.1 Create Token Storage Utility
- [ ] Create `frontend/src/lib/auth-storage.ts`
  - TokenStorage.setToken(token)
  - TokenStorage.getToken()
  - TokenStorage.clearToken()
  - authenticatedFetch() with Bearer token header

### 4.2 Create Authentication Components
- [ ] Create `frontend/src/components/auth/RegisterForm.tsx`
  - Form with name, email, password, phone, skinType
  - Validation (passwords match, minlength 6)
  - Post to /api/auth/register
  - Store token on success
  - Redirect to /dashboard

- [ ] Create `frontend/src/components/auth/LoginForm.tsx`
  - Form with email, password
  - Post to /api/auth/login
  - Store token on success
  - Redirect to /dashboard

- [ ] Create `frontend/src/components/auth/ProfilePage.tsx`
  - Fetch user data from /api/auth/me
  - Allow edit name, phone, skinType
  - Put to /api/auth/profile with updates
  - Logout button

- [ ] Create `frontend/src/components/auth/ProtectedRoute.tsx`
  - Check token exists
  - Redirect to /login if not authenticated

### 4.3 Create Authentication Pages
- [ ] Create `frontend/src/app/login/page.tsx`
  - Use LoginForm component
  - Centered layout

- [ ] Create `frontend/src/app/register/page.tsx`
  - Use RegisterForm component
  - Centered layout

- [ ] Create `frontend/src/app/dashboard/page.tsx`
  - Wrap ProfilePage in ProtectedRoute
  - Protected page example

### 4.4 Update Existing Pages
- [ ] Update `frontend/src/app/layout.tsx` (optional)
  - Add logout link in header if authenticated
  - Show user name if authenticated

---

## Phase 5: Testing (30 mins)

### 5.1 Backend Testing
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Verify: "Server running on port 3001"
- [ ] Verify: "MongoDB connected"
- [ ] Verify: No errors in console

### 5.2 Database Testing
- [ ] Open MongoDB Atlas Dashboard
- [ ] Go to Databases → Your Cluster → Browse Collections
- [ ] Verify collections exist (or will auto-create on first save)

### 5.3 Frontend Testing
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Navigate to http://localhost:9002/register
- [ ] Fill form with test data:
  ```
  Name: Test User
  Email: test@example.com
  Password: test123
  Confirm: test123
  Phone: +1234567890
  Skin Type: Normal
  ```
- [ ] Click Register
- [ ] Should redirect to /dashboard
- [ ] Should see profile data displayed

### 5.4 Verify MongoDB Entry
- [ ] Go to MongoDB Atlas → Collections → users
- [ ] Find entry with email "test@example.com"
- [ ] Verify password is hashed (not plaintext)
- [ ] Password should look like: `$2a$10$...` (bcryptjs hash)

### 5.5 Test Login
- [ ] Clear localStorage: `localStorage.clear()` in console
- [ ] Navigate to http://localhost:9002/login
- [ ] Enter credentials:
  ```
  Email: test@example.com
  Password: test123
  ```
- [ ] Click Sign In
- [ ] Should redirect to /dashboard
- [ ] Should see same user data

### 5.6 Test Protected Routes
- [ ] In console: `localStorage.clear()`
- [ ] Navigate directly to http://localhost:9002/dashboard
- [ ] Should redirect to /login
- [ ] Login and should redirect back to /dashboard

### 5.7 Test Profile Update
- [ ] On dashboard, change name to "Updated User"
- [ ] Change skin type to "Oily"
- [ ] Click "Update Profile"
- [ ] Should see success message
- [ ] Refresh page - should persist new values
- [ ] Check MongoDB - should be updated

### 5.8 Test Token Storage
- [ ] Open DevTools → Application → Local Storage
- [ ] After login, should see `auth_token` entry
- [ ] Token value should be long JWT string
- [ ] After logout, should be removed

---

## Phase 6: Production Preparation (Optional)

### 6.1 Environment Variables
- [ ] Create MongoDB production cluster (M2 or higher)
- [ ] Update backend `.env` with production values
- [ ] Add to DigitalOcean environment variables:
  ```
  MONGODB_URI=mongodb+srv://glamcart:PROD_PASSWORD@cluster1.xxxxx.mongodb.net/glamcart
  JWT_SECRET=production-secret-key-32-chars-minimum
  CORS_ORIGIN=https://your-vercel-domain.vercel.app
  NODE_ENV=production
  PORT=3001
  ```

### 6.2 Frontend Production
- [ ] Add to Vercel environment variables:
  ```
  NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
  NEXT_PUBLIC_ENABLE_MEDIAPIPE=true
  ```
- [ ] Deploy to Vercel

### 6.3 Backend Production
- [ ] Deploy backend to DigitalOcean
- [ ] Update MongoDB whitelist with DigitalOcean IP
- [ ] Verify authentication works in production

---

## Troubleshooting Guide

### Issue: "Cannot find module 'api-storage.ts'"
**Solution**: 
- Make sure file is at `frontend/src/lib/auth-storage.ts`
- Check file extension is `.ts` not `.tsx`
- Import path should be `@/lib/auth-storage`

### Issue: "MongoDB connection refused"
**Solution**:
- Verify MONGODB_URI in .env has correct password (no special chars without encoding)
- Check IP is whitelisted in MongoDB Atlas
- Verify cluster exists and is not paused

### Issue: "Invalid token" on protected routes
**Solution**:
- Verify JWT_SECRET matches between token creation and verification
- Check token isn't expired (tokens are valid 7 days)
- Clear localStorage and login again

### Issue: CORS Error in browser console
**Solution**:
- Check CORS_ORIGIN in backend .env matches frontend URL
- Restart backend after changing .env
- For dev: CORS_ORIGIN should be `http://localhost:9002`
- For prod: CORS_ORIGIN should be `https://yourdomain.vercel.app`

### Issue: Password hashing not working
**Solution**:
- Verify bcryptjs is installed: `npm install bcryptjs`
- Check User.js has pre('save') hook
- Hook should be: `userSchema.pre('save', async function(next) { ... })`

### Issue: Logout button doesn't redirect
**Solution**:
- Use `router.push('/login')` from `next/navigation`
- Make sure component has `'use client'` directive
- Verify TokenStorage.clearToken() is called before redirect

---

## Verification Checklist Before Next Step

- [ ] Can register new user
- [ ] Password is hashed in MongoDB (bcryptjs format)
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong credentials
- [ ] JWT token is stored in localStorage after login
- [ ] Can access protected routes with token
- [ ] Redirects to /login without token
- [ ] Can update profile
- [ ] Changes persist in MongoDB
- [ ] Can logout and token is cleared

---

## File Structure After Implementation

```
frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts (✅ already exists)
│   │   └── auth-storage.ts (➕ NEW)
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.tsx (➕ NEW)
│   │       ├── RegisterForm.tsx (➕ NEW)
│   │       ├── ProfilePage.tsx (➕ NEW)
│   │       └── ProtectedRoute.tsx (➕ NEW)
│   └── app/
│       ├── login/
│       │   └── page.tsx (➕ NEW)
│       ├── register/
│       │   └── page.tsx (➕ NEW)
│       └── dashboard/
│           └── page.tsx (➕ NEW)
└── .env.local (✅ update)

backend/
├── models/
│   └── User.js (✅ already exists)
├── routes/
│   └── auth.js (✅ already exists)
├── index.js (✅ already exists)
├── package.json (✅ already exists)
├── .env (➕ NEW - create with values)
└── .env.example (✅ already exists)
```

---

## Time Estimates

| Task | Time | Status |
|------|------|--------|
| MongoDB Atlas Setup | 30 min | ⏳ Not started |
| Backend Environment | 10 min | ⏳ Not started |
| Frontend Environment | 5 min | ⏳ Not started |
| Frontend Components | 60 min | ⏳ Not started |
| Testing | 30 min | ⏳ Not started |
| **TOTAL** | **~2.5 hours** | ⏳ |

---

## Success Criteria

✅ Complete when:
1. Can register new user
2. User data saved to MongoDB with hashed password
3. Can login with email/password
4. JWT token stored locally after login
5. Profile page shows user data
6. Can update profile (name, phone, skin type)
7. Updates persist in MongoDB
8. Protected routes redirect to login without token
9. Logout clears token and redirects
10. CORS works between frontend and backend

---

**Status**: Ready to implement  
**Last Updated**: Today  
**Next Phase**: MongoDB Atlas setup → Backend config → Frontend components → Testing
