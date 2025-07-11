import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { findUser, createUser, createWallet, updateUser } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName, phone } = value;

    // Check if user exists
    let existingUser;
    try {
      existingUser = await findUser(email);
    } catch (dbError: any) {
      logger.error('Database error during user lookup:', dbError);
      if (dbError.message?.includes('Supabase not configured')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }
      throw dbError;
    }

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const verificationToken = uuidv4();

    // Create user with verification token
    try {
      await createUser({
        id: userId,
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        verification_token: verificationToken
      });
    } catch (dbError: any) {
      logger.error('Database error during user creation:', dbError);
      if (dbError.message?.includes('Supabase not configured')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }
      throw dbError;
    }

    // Create wallet
    const walletId = uuidv4();
    try {
      await createWallet({
        id: walletId,
        user_id: userId
      });
    } catch (dbError: any) {
      logger.error('Database error during wallet creation:', dbError);
      // User was created but wallet failed - this is a partial failure
      // In production, this should be handled with a transaction
      logger.warn('User created but wallet creation failed', { userId, email });
    }

    // Generate token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    // Log verification link (in production, send actual email)
    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    logger.info('Email verification link (development only)', { 
      userId, 
      email, 
      verificationLink 
    });

    logger.info('User registered successfully', { userId, email });

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        phone: phone || null,
        email_verified: false
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify Email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token } = value;

    // Find user with verification token using raw SQL since we need to filter by verification_token
    let user;
    try {
      // We need to use a direct query since our helper functions don't support verification_token lookup
      const { supabase } = await import('../lib/supabase.js');
      if (!supabase) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }

      const { data, error: queryError } = await supabase
        .from('users')
        .select('id, email, status')
        .eq('verification_token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }
      
      user = data;
    } catch (dbError: any) {
      logger.error('Database error during email verification lookup:', dbError);
      if (dbError.message?.includes('Supabase not configured')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }
      throw dbError;
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user status and clear verification token
    try {
      await updateUser(user.id, {
        status: 'active',
        email_verified: true,
        verification_token: null
      });
    } catch (dbError: any) {
      logger.error('Database error during email verification update:', dbError);
      if (dbError.message?.includes('Supabase not configured')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }
      throw dbError;
    }

    logger.info('Email verified successfully', { userId: user.id, email: user.email });

    res.json({
      message: 'Email verified successfully. You can now log in to your account.'
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    let user;
    try {
      user = await findUser(email);
    } catch (dbError: any) {
      logger.error('Database error during login lookup:', dbError);
      if (dbError.message?.includes('Supabase not configured')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }
      throw dbError;
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({ 
        error: 'Please verify your email address to log in. Check your inbox for the verification link.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        email_verified: Boolean(user.email_verified)
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };