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
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      return { success: false, message: error.message, error: error.code };
    }

    if (!data.user) {
      return { success: false, message: 'Registration failed', error: 'SIGNUP_FAILED' };
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      email: email.toLowerCase(),
      name,
      phone: phone || null,
      role: 'BUYER',
      email_verified: false
    });

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
    // Use Supabase Auth's built-in OTP verification (the code sent via email on signUp)
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: otp,
      type: 'signup'
    });

    if (error) {
      return { success: false, message: 'Invalid or expired OTP. Please check the code from your email.', error: 'INVALID_OTP' };
    }

    // Mark profile as email verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('email', email.toLowerCase());

    if (profileError) {
      return { success: false, message: 'Failed to verify email', error: profileError.message };
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, message: 'Profile not found', error: profileError?.message || 'PROFILE_NOT_FOUND' };
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
