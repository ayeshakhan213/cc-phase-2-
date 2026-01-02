# Authentication Architecture & Flow Diagrams

Complete visual reference for how authentication works in your application.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          GLAMCART SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND (Next.js 15)              BACKEND (Express.js)        │
│  ┌──────────────────────┐           ┌──────────────────────┐   │
│  │   Browser/Desktop    │           │   API Server         │   │
│  │                      │           │   Port: 3001         │   │
│  │  ┌────────────────┐  │           │                      │   │
│  │  │ UI Components  │  │           │  ┌────────────────┐  │   │
│  │  │ - Register     │  │           │  │ Auth Routes    │  │   │
│  │  │ - Login        │  │◄─────────►│  │ - register     │  │   │
│  │  │ - Profile      │  │ HTTP REST │  │ - login        │  │   │
│  │  │ - Dashboard    │  │  Calls    │  │ - me           │  │   │
│  │  └────────────────┘  │  + JWT    │  │ - profile      │  │   │
│  │                      │  Tokens   │  └────────────────┘  │   │
│  │  ┌────────────────┐  │           │                      │   │
│  │  │ localStorage   │  │           │  ┌────────────────┐  │   │
│  │  │ auth_token     │  │           │  │ Middleware     │  │   │
│  │  └────────────────┘  │           │  │ - CORS         │  │   │
│  │                      │           │  │ - Logging      │  │   │
│  │  ┌────────────────┐  │           │  │ - JSON Parse   │  │   │
│  │  │ API Client     │  │           │  └────────────────┘  │   │
│  │  │ (api.ts)       │  │           │                      │   │
│  │  └────────────────┘  │           │  ┌────────────────┐  │   │
│  │                      │           │  │ Authentication │  │   │
│  │  ┌────────────────┐  │           │  │ - bcryptjs     │  │   │
│  │  │ MediaPipe      │  │           │  │ - JWT signing  │  │   │
│  │  │ Face Mesh      │  │           │  │ - Token verify │  │   │
│  │  └────────────────┘  │           │  └────────────────┘  │   │
│  │                      │           │                      │   │
│  └──────────────────────┘           └──────────────────────┘   │
│                                                                   │
│                    MONGODB ATLAS                                 │
│                    ┌──────────────┐                              │
│                    │  Database    │                              │
│                    │              │                              │
│                    │  users       │                              │
│                    │  ├─ _id      │                              │
│                    │  ├─ name     │                              │
│                    │  ├─ email    │                              │
│                    │  ├─ password │ (hashed with bcryptjs)      │
│                    │  ├─ phone    │                              │
│                    │  ├─ skinType │                              │
│                    │  └─ dates    │                              │
│                    │              │                              │
│                    └──────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Registration Flow

```
USER FILLS REGISTRATION FORM
         ↓
   ┌─────────────────────┐
   │ RegisterForm.tsx    │
   │ Validates:          │
   │ • All fields filled │
   │ • Passwords match   │
   │ • Password ≥ 6 char │
   └─────────────────────┘
         ↓
   Validation OK? ──→ No ──→ Show error message
         │
        Yes
         ↓
   POST /api/auth/register
   {
     name: "John Doe",
     email: "john@example.com",
     password: "securePassword123",
     phone: "+1234567890",
     skinType: "oily"
   }
         ↓
   ┌─────────────────────────────────┐
   │ BACKEND (auth.js register route)│
   │                                 │
   │ 1. Validate inputs              │
   │ 2. Check if user exists         │
   │ 3. Create new User object       │
   │ 4. Call user.save()             │
   │                                 │
   │ ┌──────────────────────────┐    │
   │ │ Middleware: pre('save')  │    │
   │ │                          │    │
   │ │ 1. Generate salt         │    │
   │ │    bcryptjs.genSalt(10)  │    │
   │ │                          │    │
   │ │ 2. Hash password         │    │
   │ │    bcryptjs.hash()       │    │
   │ │                          │    │
   │ │ password: "plaintext"    │    │
   │ │    ↓ transforms to ↓     │    │
   │ │ password: "$2a$10$..."   │    │
   │ └──────────────────────────┘    │
   │                                 │
   │ 5. Save user to MongoDB         │
   │ 6. Generate JWT token           │
   │    jwt.sign({ id }, secret,     │
   │             { expiresIn: '7d'}) │
   │                                 │
   │ 7. Return response with token   │
   └─────────────────────────────────┘
         ↓
   ┌───────────────────────────────┐
   │ MONGODB ATLAS                 │
   │                               │
   │ users collection:             │
   │ {                             │
   │   _id: "507f...",             │
   │   name: "John Doe",           │
   │   email: "john@...",          │
   │   password: "$2a$10$...",  ◄─── HASHED!
   │   phone: "+1234567890",       │
   │   skinType: "oily",           │
   │   createdAt: Date             │
   │ }                             │
   └───────────────────────────────┘
         ↓
   Response from Backend:
   {
     success: true,
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     user: {
       id: "507f1f77...",
       name: "John Doe",
       email: "john@example.com"
     }
   }
         ↓
   ┌──────────────────────────┐
   │ Frontend receives token  │
   │                          │
   │ TokenStorage.setToken()  │
   │                          │
   │ localStorage: {          │
   │   auth_token: "eyJ..."   │
   │ }                        │
   └──────────────────────────┘
         ↓
   router.push('/dashboard')
         ↓
   Dashboard component loads
   user data from /api/auth/me
         ↓
   ✅ USER REGISTERED & LOGGED IN
```

---

## Login Flow

```
USER ENTERS EMAIL & PASSWORD
         ↓
   ┌─────────────────────┐
   │ LoginForm.tsx       │
   │ Validates:          │
   │ • Email not empty   │
   │ • Password not empty│
   └─────────────────────┘
         ↓
   Validation OK? ──→ No ──→ Show error
         │
        Yes
         ↓
   POST /api/auth/login
   {
     email: "john@example.com",
     password: "securePassword123"
   }
         ↓
   ┌──────────────────────────────────┐
   │ BACKEND (auth.js login route)    │
   │                                  │
   │ 1. Validate inputs               │
   │ 2. Find user by email            │
   │    User.findOne({ email })       │
   │    .select('+password')          │
   │                                  │
   │ 3. User exists? ──→ No ──→ Error │
   │         │                        │
   │        Yes                       │
   │         ↓                        │
   │ 4. Compare password              │
   │    bcryptjs.compare(             │
   │      plaintext,      ◄─ What user entered
   │      hashed          ◄─ From database
   │    )                 │            │
   │         │                        │
   │    Returns true/false           │
   │         ↓                        │
   │ 5. Password correct? ──→ No ──→ Error
   │         │                       │
   │        Yes                      │
   │         ↓                        │
   │ 6. Generate JWT token            │
   │    jwt.sign({ id }, secret)     │
   │                                  │
   │ 7. Return token & user data      │
   └──────────────────────────────────┘
         ↓
   Response:
   {
     success: true,
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     user: { id, name, email, ... }
   }
         ↓
   ┌──────────────────────────┐
   │ Frontend receives token  │
   │                          │
   │ TokenStorage.setToken()  │
   │                          │
   │ localStorage: {          │
   │   auth_token: "eyJ..."   │
   │ }                        │
   └──────────────────────────┘
         ↓
   router.push('/dashboard')
         ↓
   ✅ USER LOGGED IN
```

---

## JWT Token Structure

```
Token Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjUwN2YxZjc3YmNmMjAxMzAyZjc4ZjAzMSIsImlhdCI6MTcwMzA4Njk3NywiZXhwIjoxNzAzNjkxNzc3fQ.
sxLQWk_GEZzKpXzQ7H_Q_2-T3vQ8Y9K_L5M6N7O8P9Q

        ↓
Decoded into 3 parts:

HEADER (Algorithm & Type)
────────────────────────
{
  "alg": "HS256",          ◄─ Algorithm: HMAC SHA-256
  "typ": "JWT"             ◄─ Type: JSON Web Token
}

PAYLOAD (User ID & Dates)
─────────────────────────
{
  "id": "507f1f77bcf201...",  ◄─ User MongoDB ID
  "iat": 1703086977,          ◄─ Issued at timestamp
  "exp": 1703691777           ◄─ Expires at timestamp (7 days later)
}

SIGNATURE (Verification)
─────────────────────────
HMAC-SHA256(
  base64(HEADER) + "." + base64(PAYLOAD),
  JWT_SECRET          ◄─ Your secret key from .env
)

This signature proves the token hasn't been tampered with!
```

---

## Protected Routes Flow

```
User tries to access /dashboard
         ↓
   ┌──────────────────────────┐
   │ ProtectedRoute.tsx       │
   │ wrapper component        │
   └──────────────────────────┘
         ↓
   Check: TokenStorage.getToken()
         ↓
   ┌─────────────┬─────────────┐
   │             │             │
   NO            YES           │
   │             │             │
   │             └────────────→ Render dashboard
   │                               ↓
   │                          GET /api/auth/me
   │                          + JWT token in header
   │                               ↓
   │                          Backend verifies JWT
   │                          jwt.verify(token, secret)
   │                               ↓
   │                          Token valid?
   │                          ├─ YES → Return user data ✅
   │                          └─ NO → Return 401 error ❌
   │                               ↓
   │                          ProfilePage displays data
   │
   router.push('/login')
         ↓
   Redirect to /login page
         ↓
   User sees login form
```

---

## Password Hashing (bcryptjs)

```
PLAINTEXT PASSWORD:
"securePassword123"
         ↓
bcryptjs.genSalt(10)
  ├─ Generates random salt
  └─ Complexity: 10 rounds (stronger = slower)
         ↓
Salt: "$2a$10$N9qo8u.W.L5L4wSR2vq9I"
         ↓
bcryptjs.hash(password, salt)
  ├─ Combines password + salt
  ├─ Runs through SHA-512 algorithm
  ├─ Runs 2^10 = 1024 times
  └─ Creates irreversible hash
         ↓
HASHED PASSWORD (stored in MongoDB):
"$2a$10$N9qo8u.W.L5L4wSR2vq9IuHLAOmMgkSTz0EQ3kfNvPtDqtqx5cXzi"
         ↓
When user logs in:
  bcryptjs.compare("securePassword123", hashed_from_db)
  ├─ Takes plaintext password
  ├─ Applies same algorithm with same salt
  ├─ Compares result to database hash
  └─ Returns true if match, false if not
         ↓
✅ SECURE - Password never stored in plaintext
```

---

## Token Lifecycle

```
TOKEN CREATED
(registration or login)
         ↓
   JWT token generated:
   - Header: algorithm info
   - Payload: user ID + timestamps
   - Signature: verified with JWT_SECRET
         ↓
   Token sent to frontend:
   { token: "eyJ..." }
         ↓
STORED IN BROWSER
   localStorage.setItem('auth_token', token)
         ↓
USED IN REQUESTS
   Every API call with protected endpoint:
   
   fetch('/api/auth/me', {
     headers: {
       'Authorization': 'Bearer eyJ...'
     }
   })
         ↓
VERIFIED BY BACKEND
   jwt.verify(token, JWT_SECRET)
   ├─ Decodes signature
   ├─ Checks if tampered (signature must match)
   ├─ Checks if expired (current time vs exp field)
   └─ Returns decoded payload if valid
         ↓
TOKEN VALID? 
   ├─ YES → Process request, return data ✅
   └─ NO → Return 401 Unauthorized ❌
         ↓
TOKEN EXPIRES
   After 7 days (set in signToken function)
   User must login again
         ↓
TOKEN CLEARED
   On logout:
   localStorage.removeItem('auth_token')
```

---

## Error Handling Flow

```
ANY REQUEST
     ↓
     ├─ Registration Error ─→ Email already in use
     │                   └─→ Missing required fields
     │                   └─→ Password too short
     │
     ├─ Login Error ─────→ Invalid credentials
     │                └─→ User not found
     │
     ├─ Token Error ─────→ Token missing
     │                └─→ Token expired
     │                └─→ Token tampered with
     │
     └─ Server Error ────→ Database connection failed
                      └─→ Unexpected error

Each error returns:
{
  error: "Human-readable error message",
  status: HTTP_STATUS_CODE
}

Frontend displays error in Alert component
User sees user-friendly message
```

---

## State Management

```
Frontend Data Flow:
────────────────────

BEFORE LOGIN:
  localStorage: {}
  User: null
  Page: /login or /register

DURING REGISTRATION:
  1. User fills form
  2. Submits to /api/auth/register
  3. Backend saves to MongoDB
  4. Returns JWT token
  5. localStorage.setItem('auth_token', token)

AFTER LOGIN/REGISTRATION:
  localStorage: {
    'auth_token': 'eyJ...'
  }
  User: {
    id, name, email, skinType, phone
  }
  Page: /dashboard (redirected by router.push)

ON DASHBOARD:
  1. Component mounts
  2. Calls GET /api/auth/me with token
  3. Backend verifies JWT
  4. Returns user data from MongoDB
  5. Component renders ProfilePage with user data

ON PROFILE UPDATE:
  1. User edits form
  2. Submits PUT /api/auth/profile with updated data
  3. Backend updates MongoDB document
  4. Returns updated user
  5. Frontend updates state
  6. Component re-renders with new data

ON LOGOUT:
  1. User clicks logout button
  2. localStorage.removeItem('auth_token')
  3. router.push('/login')
  4. localStorage becomes: {}
  5. User: null
  6. ProtectedRoute redirects to /login on next access
```

---

## Security Considerations

```
✅ PASSWORD SECURITY
   • Never sent over unencrypted HTTP (use HTTPS in production)
   • Hashed with bcryptjs (2^10 rounds)
   • Never logged or displayed
   • Only exposed in memory during comparison
   • select: false in schema prevents accidental exposure

✅ TOKEN SECURITY
   • Signed with JWT_SECRET (keep this secret!)
   • Includes expiration (7 days default)
   • Cannot be modified without invalidating signature
   • Stored in localStorage (vulnerable to XSS)
   • Should use secure cookies in production
   • Verified on every protected request

✅ DATABASE SECURITY
   • MongoDB Atlas IP whitelist
   • Database user with limited permissions
   • Connection string in environment variables
   • Never expose MONGODB_URI or JWT_SECRET

✅ CORS SECURITY
   • Only allows requests from CORS_ORIGIN
   • Prevents unauthorized domain access
   • Set to specific domain in production
   • localhost:9002 for development

⚠️ RECOMMENDATIONS FOR PRODUCTION
   • Use HTTPS (not HTTP)
   • Store JWT in secure HttpOnly cookie (not localStorage)
   • Implement token refresh mechanism
   • Add rate limiting to auth endpoints
   • Log security events
   • Enable MongoDB encryption at rest
   • Use stronger JWT_SECRET (32+ chars, random)
   • Implement email verification
   • Add password strength requirements
   • Enable two-factor authentication
```

---

## Response Examples

```
SUCCESS - Register/Login:
──────────────────────────
Status: 201 (Create) or 200 (Login)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf201302f78f031",
    "name": "John Doe",
    "email": "john@example.com",
    "skinType": "oily",
    "phone": "+1234567890"
  }
}

SUCCESS - Get Profile:
──────────────────────
Status: 200
{
  "success": true,
  "user": {
    "id": "507f1f77bcf201302f78f031",
    "name": "John Doe",
    "email": "john@example.com",
    "skinType": "oily",
    "phone": "+1234567890",
    "preferredColors": ["#FF1493", "#FF69B4"]
  }
}

ERROR - Registration:
──────────────────────
Status: 400 or 500
{
  "error": "Email already in use"
}

ERROR - Login:
──────────────
Status: 401
{
  "error": "Invalid credentials"
}

ERROR - Protected Route (No Token):
──────────────────────────────────
Status: 401
{
  "error": "Not authenticated"
}

ERROR - Token Expired:
───────────────────────
Status: 401
{
  "error": "Not authenticated"
}
```

---

## Component Dependency Graph

```
App Layout
    │
    ├─── Header (shows user name if authenticated)
    │
    ├─── /login
    │    └─── LoginForm
    │         └─── api.ts (apiPost)
    │             └─── TokenStorage.setToken()
    │
    ├─── /register
    │    └─── RegisterForm
    │         └─── api.ts (apiPost)
    │             └─── TokenStorage.setToken()
    │
    ├─── /dashboard (Protected)
    │    └─── ProtectedRoute
    │         ├─── TokenStorage.getToken()
    │         └─── ProfilePage
    │              ├─── authenticatedFetch()
    │              │    └─── TokenStorage.getToken()
    │              └─── Displays user profile
    │
    └─── /try-on (Virtual Lipstick)
         ├─── MediaPipe face detection
         └─── Can show user's preferred colors if logged in
```

---

## Database Schema

```
MongoDB Collections:

USERS Collection:
{
  _id: ObjectId,
  name: String (required, max 50),
  email: String (required, unique),
  password: String (hashed, required),
  phone: String,
  skinType: String (enum: ['oily', 'dry', 'combination', 'sensitive', 'normal']),
  preferredColors: [String],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Example Document:
{
  "_id": ObjectId("507f1f77bcf201302f78f031"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$N9qo8u.W.L5L4wSR2vq9IuHLAOmMgkSTz0EQ3kfNvPtDqtqx5cXzi",
  "phone": "+1234567890",
  "skinType": "oily",
  "preferredColors": ["#FF1493", "#FF69B4", "#DC143C"],
  "createdAt": ISODate("2024-01-21T12:34:56Z"),
  "updatedAt": ISODate("2024-01-22T10:20:30Z")
}
```

---

**Visual Reference**: Keep these diagrams handy while implementing  
**Updated**: January 2024  
**Version**: 1.0
