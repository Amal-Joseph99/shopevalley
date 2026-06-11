# Supabase Admin Account Setup Guide

## Overview
This guide explains how to create the admin account for Shopevalley after setting up Supabase auth.

## Admin Account Details
- **Email**: info@metricfluxsolutions.com
- **Password**: Akhi@5656
- **Name**: JOSNA JOSE
- **Role**: ADMIN
- **Email Status**: VERIFIED

## Setup Methods

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: **SHOPEVALLEY**

2. **Create Auth User**
   - Go to: Authentication → Users
   - Click "Invite" button
   - Enter email: `info@metricfluxsolutions.com`
   - Enter password: `Akhi@5656`
   - Check "Auto confirm user" to verify email immediately
   - Click "Send invite"

3. **Create Profile Record**
   - Go to: SQL Editor
   - Create new query
   - Paste this SQL:

```sql
INSERT INTO public.profiles (
  id,
  email,
  name,
  phone,
  role,
  email_verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'info@metricfluxsolutions.com'),
  'info@metricfluxsolutions.com',
  'JOSNA JOSE',
  NULL,
  'ADMIN',
  true,
  now(),
  now()
)
ON CONFLICT DO NOTHING;
```

   - Click "Run" to execute

### Method 2: Using CLI (If you have service_role_key)

Run the setup script:
```bash
chmod +x scripts/setup-admin.sh
./scripts/setup-admin.sh
```

**Note**: You need to provide your `SUPABASE_SERVICE_ROLE_KEY` in the script. Get it from:
- Supabase Dashboard → Project Settings → API → `service_role key`

### Method 3: Using Backend API

If you set up the Node.js server with service role key:

```bash
curl -X POST http://localhost:5000/api/admin/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@metricfluxsolutions.com",
    "password": "Akhi@5656",
    "name": "JOSNA JOSE"
  }'
```

## Verification

After setup, test the admin login:

1. Navigate to app: http://localhost:3000
2. Click "Log in to your account"
3. Enter:
   - Email: `info@metricfluxsolutions.com`
   - Password: `Akhi@5656`
4. Should redirect to `/admin` dashboard
5. Loading state should show "Verifying your account..."

## Troubleshooting

### "Email already exists" Error
- The admin email is already registered
- Delete it from Auth → Users in Supabase Dashboard
- Try creating again

### "Profile not found" Error
- The auth user exists but profile record is missing
- Run the SQL query from Method 1 Step 3 to create profile

### Login redirects to home instead of admin
- Check profile table - role should be 'ADMIN'
- Verify email_verified is set to true
- Clear browser cache/localStorage

## What's Different from Old System

| Aspect | Old (LocalStorage) | New (Supabase) |
|--------|-------------------|----------------|
| **Auth** | Simulated in localStorage | Real backend auth via Supabase |
| **User Data** | Stored in browser localStorage | Secure Supabase database |
| **Role Checking** | Frontend only | Backend + Frontend validation |
| **Admin Creation** | Hardcoded in code | Via Supabase dashboard/API |
| **OTP** | Demo only | Real OTP system (see implementation) |
| **Password** | Plaintext in localStorage | Hashed by Supabase Auth |

## For Developers

### Supabase Configuration

Environment variables (already set in `.env.local`):
```
VITE_SUPABASE_URL=https://kxldcrwpommsckpxjhhb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Auth Services Location

- **Main Auth File**: `src/lib/supabaseClient.ts`
- **Admin Setup**: `src/lib/adminSetup.ts`
- **Login Component**: `src/components/LoginScreen.tsx`
- **Server (Optional)**: `server.ts` (requires SERVICE_ROLE_KEY in env)

### API Endpoints (if server is running)

```
POST /api/admin/create-account
- body: { email, password, name }
- response: { success, message, user }

POST /api/send-otp
- body: { email }
- response: { success, message, demo_otp? }
```

## Next Steps

1. ✅ Create admin account using one of the methods above
2. ✅ Test admin login
3. ✅ Test buyer registration and OTP flow
4. ⬜ Set up email service for OTP delivery (optional)
5. ⬜ Configure password reset flow
6. ⬜ Add role-based access control (RBAC) for API endpoints
