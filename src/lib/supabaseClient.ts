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

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otpType: 'registration' | 'password_reset' = 'registration'): Promise<{ success: boolean; otp?: string; message: string }> {
  try {
    const otp = generateOTP();
    const emailLower = email.toLowerCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { error } = await supabase.from('otp_attempts').insert({
      email: emailLower,
      otp,
      otp_type: otpType,
      attempts: 0,
      expires_at: expiresAt.toISOString(),
      used: false
    });

    if (error) return { success: false, message: 'Failed to generate OTP' };
    return { success: true, otp, message: 'OTP sent to your email' };
  } catch (err: any) {
    return { success: false, message: 'Error sending OTP' };
  }
}

export async function verifyOTP(email: string, otp: string, otpType: 'registration' | 'password_reset' = 'registration'): Promise<boolean> {
  try {
    const emailLower = email.toLowerCase();
    const { data, error } = await supabase
      .from('otp_attempts')
      .select('*')
      .eq('email', emailLower)
      .eq('otp', otp)
      .eq('otp_type', otpType)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return false;
    await supabase.from('otp_attempts').update({ used: true }).eq('id', data.id);
    return true;
  } catch (err: any) {
    return false;
  }
}

export async function registerBuyer(email: string, name: string, password: string, phone?: string): Promise<AuthResponse> {
  try {
    // Store name/phone in user_metadata so it's available after OTP verification
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { name, phone: phone || null, role: 'BUYER' }
      }
    });

    if (error) {
      return { success: false, message: error.message, error: error.code };
    }

    if (!data.user) {
      return { success: false, message: 'Registration failed', error: 'SIGNUP_FAILED' };
    }

    // Best-effort profile creation (may fail due to RLS on unconfirmed users — that's OK,
    // the profile will be guaranteed to exist after OTP verification)
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: email.toLowerCase(),
      name,
      phone: phone || null,
      role: 'BUYER',
      email_verified: false
    }).then(() => {});

    // Supabase Auth automatically sends the OTP email on signUp
    return {
      success: true,
      message: 'Registration successful. OTP sent to your email.',
      data: { userId: data.user.id, email: email.toLowerCase() }
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Registration error', error: 'REGISTER_ERROR' };
  }
}

export async function verifyRegistrationOTP(email: string, otp: string): Promise<AuthResponse> {
  try {
    const emailLower = email.toLowerCase();

    // Use Supabase Auth's built-in OTP verification (the code sent via email on signUp)
    const { data, error } = await supabase.auth.verifyOtp({
      email: emailLower,
      token: otp,
      type: 'signup'
    });

    if (error) {
      // Token expired or invalid — auto-resend a fresh code
      if (error.message?.toLowerCase().includes('expired') || error.message?.toLowerCase().includes('invalid') || (error as any).code === 'otp_expired') {
        await supabase.auth.resend({ type: 'signup', email: emailLower });
        return {
          success: false,
          message: 'Your code has expired. A new code has been sent to your email.',
          error: 'OTP_EXPIRED'
        };
      }
      return { success: false, message: error.message || 'Verification failed', error: 'INVALID_OTP' };
    }

    // Verification succeeded — user now has a confirmed session
    const user = data.user;
    if (!user) {
      return { success: false, message: 'Verification failed — no user returned', error: 'NO_USER' };
    }

    // Guarantee profile exists (it may have failed during registration due to RLS)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingProfile) {
      // Create the profile now using metadata stored during signUp
      const meta = user.user_metadata || {};
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: emailLower,
        name: meta.name || '',
        phone: meta.phone || null,
        role: meta.role || 'BUYER',
        email_verified: true
      });

      if (insertError) {
        return { success: false, message: 'Account verified but profile creation failed. Please contact support.', error: insertError.message };
      }
    } else {
      // Profile exists — mark as verified
      await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', user.id);
    }

    return { success: true, message: 'Email verified successfully', data };
  } catch (err: any) {
    return { success: false, message: err.message || 'Verification error', error: 'VERIFY_ERROR' };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      return { success: false, message: 'Invalid email or password', error: error.code };
    }

    if (!data.user) {
      return { success: false, message: 'Login failed', error: 'NO_USER' };
    }

    // Fetch profile — use maybeSingle to avoid 406 on 0 rows
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    // If profile doesn't exist, create it from user_metadata (handles edge cases)
    if (!profile) {
      const meta = data.user.user_metadata || {};
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email.toLowerCase(),
          name: meta.name || email.split('@')[0],
          phone: meta.phone || null,
          role: meta.role || 'BUYER',
          email_verified: !!data.user.email_confirmed_at
        })
        .select('*')
        .single();

      if (insertError || !newProfile) {
        return { success: false, message: 'Login succeeded but profile setup failed. Please contact support.', error: insertError?.message || 'PROFILE_CREATE_FAILED' };
      }
      profile = newProfile;
    }

    return { success: true, message: 'Login successful', data: { user: data.user, profile, session: data.session } };
  } catch (err: any) {
    return { success: false, message: err.message || 'Login error', error: 'LOGIN_ERROR' };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, message: error.message, error: error.code };
    }
    return { success: true, message: 'Logged out successfully' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Logout error', error: 'LOGOUT_ERROR' };
  }
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch profile — use maybeSingle to avoid 406
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Auto-create profile if missing (handles edge cases from before the fix)
    if (!profile) {
      const meta = user.user_metadata || {};
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          name: meta.name || user.email?.split('@')[0] || '',
          phone: meta.phone || null,
          role: meta.role || 'BUYER',
          email_verified: !!user.email_confirmed_at
        })
        .select('*')
        .single();
      profile = newProfile;
    }

    return profile || null;
  } catch (err) {
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<AuthResponse> {
  try {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) {
      return { success: false, message: 'Failed to update profile', error: error.message };
    }
    return { success: true, message: 'Profile updated successfully' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Update error', error: 'UPDATE_ERROR' };
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const otpResult = await sendOTPEmail(email.toLowerCase(), 'password_reset');
    if (!otpResult.success) {
      return { success: false, message: 'Failed to send reset OTP', error: 'SEND_OTP_FAILED' };
    }
    return { success: true, message: 'Password reset OTP sent to your email' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Request error', error: 'REQUEST_ERROR' };
  }
}

export async function resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
  try {
    if (!await verifyOTP(email.toLowerCase(), otp, 'password_reset')) {
      return { success: false, message: 'Invalid or expired OTP', error: 'INVALID_OTP' };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: 'Failed to update password', error: error.message };
    }

    return { success: true, message: 'Password updated successfully' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Reset error', error: 'RESET_ERROR' };
  }
}
