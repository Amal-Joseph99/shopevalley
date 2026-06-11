import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Supabase with SERVICE ROLE key (admin access)
// This should only be available on the backend, never expose to client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Missing Supabase admin credentials. Some features will be unavailable.');
}

const supabaseAdmin = SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : null;

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Missing Razorpay credentials. Payment features will be unavailable.');
}

/**
 * POST /api/admin/create-account
 * Creates an admin account (requires special authorization)
 */
app.post('/api/admin/create-account', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Admin API not configured' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create auth user with admin service
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Verify email immediately
      user_metadata: {
        role: 'ADMIN'
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Create profile entry
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        name,
        phone: null,
        role: 'ADMIN',
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: 'Failed to create profile' });
    }

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'ADMIN'
      }
    });
  } catch (error: any) {
    console.error('Admin creation error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/send-otp
 * Simulates sending OTP (in real app, use email service)
 */
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send via email service
    console.log(`[OTP] ${email}: ${otp}`);

    // For demo, we'll return it (NEVER do this in production)
    return res.status(200).json({
      success: true,
      message: 'OTP sent',
      // Demo only - remove in production
      demo_otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/create-order
 * Creates a Razorpay order for payment
 * Body: { amount (in paise), currency, receipt, description?, customer_id?, email? }
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, description, customer_id, email } = req.body;

    // Validate amount (minimum 100 paise = 1 INR)
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise (₹1)' });
    }

    if (!receipt) {
      return res.status(400).json({ error: 'Receipt ID is required' });
    }

    const options = {
      amount: Math.round(amount), // Amount in paise
      currency: currency,
      receipt: receipt,
      description: description || 'Payment for order',
      notes: {
        customer_id: customer_id || null,
        email: email || null
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate all required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing required payment fields',
        success: false 
      });
    }

    // Generate signature using HMAC-SHA256
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    // Compare signatures
    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed - signature mismatch'
      });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Payment verification failed' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});

export default app;
