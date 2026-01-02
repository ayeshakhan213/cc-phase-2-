# Frontend Authentication Components Guide

Complete setup for register, login, and profile components with token management.

## Overview

**Already Ready**:
- ✅ API Client (`frontend/src/lib/api.ts`) - generic apiFetch wrapper
- ✅ Backend Routes - register, login, profile, update profile
- ✅ User Model - with bcryptjs hashing and validation
- ✅ JWT Token Signing - 7-day expiration

**Need to Create**:
- [ ] Token storage utilities
- [ ] Register component
- [ ] Login component
- [ ] Profile component
- [ ] Protected route wrapper
- [ ] Auth context (optional but recommended)

---

## 1. Token Storage Utility

Create `frontend/src/lib/auth-storage.ts`:

```typescript
// Token storage with localStorage/cookie options
export const TokenStorage = {
  // Store token in localStorage
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  // Retrieve token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // Remove token
  clearToken: () => {
    localStorage.removeItem('auth_token');
  },

  // Check if token exists
  hasToken: (): boolean => {
    return !!localStorage.getItem('auth_token');
  }
};

// Enhanced API calls with token in header
export async function authenticatedFetch<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
) {
  const token = TokenStorage.getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}
```

---

## 2. Register Component

Create `frontend/src/components/auth/RegisterForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiPost } from '@/lib/api';
import { TokenStorage } from '@/lib/auth-storage';

interface RegisterResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    skinType: string;
    phone: string;
  };
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skinType: 'normal'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Register
      const response = await apiPost<RegisterResponse>('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        skinType: formData.skinType
      });

      if (!response.data?.token) {
        throw new Error('No token received from server');
      }

      // Store token
      TokenStorage.setToken(response.data.token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password *</label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password *</label>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Skin Type</label>
            <select
              name="skinType"
              value={formData.skinType}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-md p-2"
            >
              <option value="normal">Normal</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## 3. Login Component

Create `frontend/src/components/auth/LoginForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiPost } from '@/lib/api';
import { TokenStorage } from '@/lib/auth-storage';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    skinType: string;
    phone: string;
  };
}

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }

      const response = await apiPost<LoginResponse>('/api/auth/login', {
        email,
        password
      });

      if (!response.data?.token) {
        throw new Error(response.error || 'Login failed');
      }

      // Store token
      TokenStorage.setToken(response.data.token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to GlamCart</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## 4. Profile Component

Create `frontend/src/components/auth/ProfilePage.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authenticatedFetch, TokenStorage } from '@/lib/auth-storage';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  skinType: string;
  phone: string;
  preferredColors?: string[];
}

export function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skinType: 'normal'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/auth/me');
      
      if (response.user) {
        setUser(response.user);
        setFormData({
          name: response.user.name,
          phone: response.user.phone || '',
          skinType: response.user.skinType
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUpdating(true);

    try {
      const response = await authenticatedFetch(
        '/api/auth/profile',
        'PUT',
        formData
      );

      if (response.user) {
        setUser(response.user);
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    TokenStorage.clearToken();
    router.push('/login');
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">Failed to load profile</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={updating}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1234567890"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Skin Type</label>
                <select
                  value={formData.skinType}
                  onChange={(e) => setFormData({...formData, skinType: e.target.value})}
                  disabled={updating}
                  className="w-full border rounded-md p-2"
                >
                  <option value="normal">Normal</option>
                  <option value="oily">Oily</option>
                  <option value="dry">Dry</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={updating} className="w-full">
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. Protected Route Wrapper

Create `frontend/src/components/auth/ProtectedRoute.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@/lib/auth-storage';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = TokenStorage.getToken();
    
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 6. Usage in Next.js Pages

### Login Page

Create `frontend/src/app/login/page.tsx`:

```typescript
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

### Register Page

Create `frontend/src/app/register/page.tsx`:

```typescript
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}
```

### Dashboard (Protected)

Create `frontend/src/app/dashboard/page.tsx`:

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfilePage } from '@/components/auth/ProfilePage';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
```

---

## Testing Checklist

### Before Testing
- [ ] Backend `.env` configured with MongoDB Atlas connection string
- [ ] Backend `.env` has JWT_SECRET set
- [ ] Backend `.env` has CORS_ORIGIN (set to localhost:9002 for dev)
- [ ] Frontend `.env.local` has NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

### Test Sequence
1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   # Should show: ✓ Server running on port 3001
   # Should show: ✓ MongoDB connected
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   # Should show: ✓ Server running on localhost:9002
   ```

3. **Test Registration**
   - Go to http://localhost:9002/register
   - Fill in form (all fields required)
   - Should redirect to /dashboard
   - Check MongoDB Atlas → browse collections → users collection

4. **Test Login**
   - Logout or clear token: `localStorage.clear()`
   - Go to http://localhost:9002/login
   - Use credentials from registration
   - Should redirect to /dashboard

5. **Test Profile**
   - On dashboard, verify user data is displayed
   - Update name and skin type
   - Check MongoDB for changes

6. **Test Protected Routes**
   - Clear token: `localStorage.clear()`
   - Try accessing /dashboard directly
   - Should redirect to /login

---

## Troubleshooting

### Registration Fails with "Email already in use"
- Check MongoDB Atlas → Collections → Users
- Delete test user and try again
- Or use different email address

### Login Shows "Invalid credentials"
- Verify email and password are correct
- Check password doesn't have extra spaces
- Check user exists in MongoDB

### CORS Error in Console
- Verify `CORS_ORIGIN` in backend `.env`
- Should be `http://localhost:9002` for development
- Restart backend after changing `.env`

### Token Not Persisting
- Open DevTools → Application → Local Storage
- Check if `auth_token` is saved
- If not, check register/login response has token

### Protected Route Always Redirects
- Check if token exists: `localStorage.getItem('auth_token')`
- If empty, login again
- Token expires after 7 days (need login refresh)

---

## Next Steps

1. ✅ Create auth-storage.ts utility
2. ✅ Create RegisterForm component
3. ✅ Create LoginForm component
4. ✅ Create ProfilePage component
5. ✅ Create ProtectedRoute wrapper
6. ✅ Create login/register/dashboard pages
7. ✅ Test entire auth flow
8. ✅ Add "logout" button to header
9. ✅ Protect other routes (admin, stylist, etc.)
10. ✅ Deploy to Vercel with production env vars

---

**Status**: Ready for implementation  
**Estimated Time**: ~1-2 hours  
**Difficulty**: Moderate
