import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'BUYER';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in localStorage with expiration (5 minutes)
export function storeOTP(email: string, otp: string): void {
  const otpData = {
    otp,
    email,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes from now
  };
  localStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
}

// Verify OTP
export function verifyOTP(email: string, otp: string): boolean {
  const stored = localStorage.getItem(`otp_${email}`);
  if (!stored) return false;

  const otpData = JSON.parse(stored);
  
  // Check if expired
  if (Date.now() > otpData.expiresAt) {
    localStorage.removeItem(`otp_${email}`);
    return false;
  }

  // Check if OTP matches
  if (otpData.otp === otp) {
    localStorage.removeItem(`otp_${email}`);
    return true;
  }

  return false;
}

// Clear OTP
export function clearOTP(email: string): void {
  localStorage.removeItem(`otp_${email}`);
}

// Simulate sending OTP via email (in real app, this would be a backend call)
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  // In production, this would call your backend API
  // For now, we'll store it and console log
  console.log(`[SIMULATED EMAIL] OTP sent to ${email}: ${otp}`);
  
  // Store for verification later
  storeOTP(email, otp);
  
  return true;
}

// Register new buyer
export async function registerBuyer(email: string, name: string, password: string, phone?: string): Promise<AuthResponse> {
  try {
    // Create auth user via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Registration failed',
        error: 'SIGNUP_FAILED'
      };
    }

    // Create profile entry after auth signup. If this fails due to RLS or
    // other DB-side restrictions, we still proceed with OTP so the user
    // can complete email verification in the app. Migration must be
    // applied on the Supabase project to allow client-side inserts.
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        role: 'BUYER',
        email_verified: false
      });

    let profileCreated = true;
    if (profileError) {
      console.warn('Profile insert failed during signup:', profileError.message || profileError);
      profileCreated = false;
    }

    // Generate and send OTP regardless of profile insert result
    const otp = generateOTP();
    await sendOTPEmail(email.toLowerCase(), otp);

    return {
      success: true,
      message: profileCreated
        ? 'Registration successful. OTP sent to your email.'
        : 'Registration created but profile persistence pending. OTP sent to your email.',
      data: {
        userId: data.user.id,
        email: email.toLowerCase(),
        profileCreated,
        profileError: profileError ? (profileError.message || String(profileError)) : null
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Registration error',
      error: 'REGISTER_ERROR'
    };
  }
}

// Verify OTP and complete registration
export async function verifyRegistrationOTP(email: string, otp: string): Promise<AuthResponse> {
  try {
    // Verify OTP
    if (!verifyOTP(email, otp)) {
      return {
        success: false,
        message: 'Invalid or expired OTP',
        error: 'INVALID_OTP'
      };
    }

    // Mark email as verified in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('email', email.toLowerCase());

    if (error) {
      return {
        success: false,
        message: 'Failed to verify email',
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Verification error',
      error: 'VERIFY_ERROR'
    };
  }
}

// Login user with role check
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: error.code
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Login failed',
        error: 'NO_USER'
      };
    }

    // Get profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: 'Profile not found',
        error: profileError?.message || 'PROFILE_NOT_FOUND'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: data.user,
        profile,
        session: data.session
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Login error',
      error: 'LOGIN_ERROR'
    };
  }
}

// Logout
export async function logoutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.code
      };
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Logout error',
      error: 'LOGOUT_ERROR'
    };
  }
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) return null;

    return profile;
  } catch (err) {
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<AuthResponse> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Update error',
      error: 'UPDATE_ERROR'
    };
  }
}
