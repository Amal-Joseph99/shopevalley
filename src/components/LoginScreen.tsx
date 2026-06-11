import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Check, 
  Loader,
  ArrowLeft,
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';
import { LoggedUser } from '../types';
import {
  registerBuyer,
  verifyRegistrationOTP,
  loginUser,
  sendOTPEmail,
  generateOTP
} from '../lib/supabaseClient';

interface LoginScreenProps {
  onNavigate: (path: string) => void;
  onLoginSuccess: (user: LoggedUser) => void;
}

export default function LoginScreen({ onNavigate, onLoginSuccess }: LoginScreenProps) {
  const [viewState, setViewState] = useState<'login' | 'register' | 'otp' | 'loading'>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // OTP states
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  // OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (viewState === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && viewState === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [viewState, otpTimer]);

  const handleResendOtp = async () => {
    try {
      const otp = generateOTP();
      await sendOTPEmail(otpEmail, otp);
      setOtpTimer(45);
      setCanResend(false);
      setOtpError('');
    } catch (err) {
      setOtpError('Failed to resend OTP');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    setViewState('loading');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter your email and password.');
      setIsLoggingIn(false);
      setViewState('login');
      return;
    }

    try {
      const response = await loginUser(loginEmail, loginPassword);

      if (!response.success) {
        setLoginError(response.message || 'Login failed');
        setIsLoggingIn(false);
        setViewState('login');
        return;
      }

      const { profile } = response.data;

      const loggedUser: LoggedUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phone,
        role: profile.role,
        email_verified: profile.email_verified,
        addresses: [],
        created_at: profile.created_at
      };

      onLoginSuccess(loggedUser);

      // Navigate based on role with loading state
      if (profile.role === 'ADMIN') {
        setTimeout(() => onNavigate('admin'), 500);
      } else {
        setTimeout(() => onNavigate(''), 500);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login error occurred');
      setIsLoggingIn(false);
      setViewState('login');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setIsRegistering(true);

    if (!regName || !regEmail || !regPassword) {
      setRegisterError('Name, email, and password are required.');
      setIsRegistering(false);
      return;
    }

    if (!acceptTerms) {
      setRegisterError('You must agree to Terms & Policies.');
      setIsRegistering(false);
      return;
    }

    try {
      const response = await registerBuyer(regEmail, regName, regPassword, regPhone || undefined);

      if (!response.success) {
        setRegisterError(response.message || 'Registration failed');
        setIsRegistering(false);
        return;
      }

      // Move to OTP verification
      setOtpEmail(regEmail);
      setOtpValue(['', '', '', '', '', '']);
      setOtpTimer(45);
      setCanResend(false);
      setViewState('otp');
      setIsRegistering(false);
    } catch (err: any) {
      setRegisterError(err.message || 'Registration error');
      setIsRegistering(false);
    }
  };

  const handleOtpInput = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    
    const newOtp = [...otpValue];
    newOtp[index] = val.slice(-1);
    setOtpValue(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setIsVerifyingOtp(true);

    const filledDigits = otpValue.join('');
    if (filledDigits.length < 6) {
      setOtpError('Please enter a complete 6-digit code.');
      setIsVerifyingOtp(false);
      return;
    }

    try {
      const response = await verifyRegistrationOTP(otpEmail, filledDigits);

      if (!response.success) {
        setOtpError(response.message || 'Verification failed');
        setIsVerifyingOtp(false);
        return;
      }

      // Auto-login after verification
      const loginResponse = await loginUser(otpEmail, regPassword);

      if (loginResponse.success) {
        const { profile } = loginResponse.data;

        const loggedUser: LoggedUser = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phoneNumber: profile.phone,
          role: profile.role,
          email_verified: profile.email_verified,
          addresses: [],
          created_at: profile.created_at
        };

        onLoginSuccess(loggedUser);
        onNavigate('');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Verification error');
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans" id="sv_auth_workspace">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            {viewState === 'loading' && 'Signing in...'}
            {viewState === 'login' && 'Log in to your account'}
            {viewState === 'register' && 'Create your account'}
            {viewState === 'otp' && 'Verify Email'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {viewState === 'login' && 'Access your buyer dashboard or admin portal'}
            {viewState === 'register' && 'Create account as a buyer'}
            {viewState === 'otp' && `6-digit code sent to ${otpEmail}`}
            {viewState === 'loading' && 'Please wait...'}
          </p>
        </div>

        {/* LOADING STATE */}
        {viewState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader className="w-12 h-12 text-slate-900 animate-spin" />
            <p className="text-sm text-slate-600">Verifying your account...</p>
          </div>
        )}

        {/* LOGIN FORM */}
        {viewState === 'login' && (
          <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit} id="sv_login_form">
            {loginError && (
              <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all text-slate-950 disabled:opacity-50"
                    disabled={isLoggingIn}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all text-slate-950 disabled:opacity-50"
                    disabled={isLoggingIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
                    disabled={isLoggingIn}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-slate-950 text-white font-bold text-sm rounded-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-500">New here?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewState('register');
                setRegisterError('');
              }}
              className="w-full py-2.5 px-4 border-2 border-slate-950 text-slate-950 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all"
            >
              Create Account
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {viewState === 'register' && (
          <form className="mt-8 space-y-4" onSubmit={handleRegisterSubmit} id="sv_register_form">
            {registerError && (
              <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{registerError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all text-slate-950 disabled:opacity-50"
                    disabled={isRegistering}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all text-slate-950 disabled:opacity-50"
                    disabled={isRegistering}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all text-slate-950 disabled:opacity-50"
                  disabled={isRegistering}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all text-slate-950 disabled:opacity-50"
                    disabled={isRegistering}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
                    disabled={isRegistering}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 mt-0.5 disabled:opacity-50"
                  disabled={isRegistering}
                />
                <span className="text-slate-600">
                  I agree to the <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-2.5 px-4 bg-slate-950 text-white font-bold text-sm rounded-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewState('login')}
              className="w-full py-2.5 px-4 border-2 border-slate-300 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        )}

        {/* OTP VERIFICATION FORM */}
        {viewState === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtpSubmit} id="sv_otp_form">
            {otpError && (
              <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Enter 6-Digit Code
              </label>
              <div className="flex gap-2 justify-between">
                {otpValue.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    placeholder="0"
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-slate-950 focus:outline-none transition-all bg-slate-50 disabled:opacity-50"
                    disabled={isVerifyingOtp}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              {otpTimer > 0 ? (
                <p className="text-xs text-slate-600">
                  Resend in <strong>{otpTimer}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isVerifyingOtp}
                  className="text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp || otpValue.join('').length < 6}
              className="w-full py-2.5 px-4 bg-slate-950 text-white font-bold text-sm rounded-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
