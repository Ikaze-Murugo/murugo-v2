import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { User } from '../models/User.model';
import { Profile } from '../models/Profile.model';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.util';
import { successResponse, errorResponse } from '../utils/response.util';
import crypto from 'crypto';
import redisClient from '../config/redis';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, password, role, profileType, name, whatsappNumber } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const profileRepository = AppDataSource.getRepository(Profile);

    // Check if user exists
    const existingUser = await userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      errorResponse(res, 'User already exists with this email or phone', 400);
      return;
    }

    // Create user
    const user = userRepository.create({
      email,
      phone,
      password,
      role,
      profileType,
      whatsappNumber,
    });

    await userRepository.save(user);

    // Create profile
    const profile = profileRepository.create({
      userId: user.id,
      name,
    });

    await profileRepository.save(profile);

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    successResponse(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile,
        },
        token,
        refreshToken,
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: email ? { email } : { phone },
      relations: ['profile'],
    });

    if (!user || !(await user.comparePassword(password))) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    if (!user.isActive) {
      errorResponse(res, 'Account is deactivated', 403);
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await userRepository.save(user);

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
      },
      token,
      refreshToken,
    });
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const verifyOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, otp, type } = req.body; // type: 'email' or 'phone'

    if (!otp || !type) {
      errorResponse(res, 'OTP and type are required', 400);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Get OTP from Redis
    const key = `otp:${type}:${email || phone}`;
    const storedOTP = redisClient ? await redisClient.get(key) : null;

    if (!storedOTP) {
      errorResponse(res, 'OTP expired or not found', 400);
      return;
    }

    if (storedOTP !== otp) {
      errorResponse(res, 'Invalid OTP', 400);
      return;
    }

    // Mark as verified
    if (type === 'email') {
      user.isEmailVerified = true;
    } else if (type === 'phone') {
      user.isPhoneVerified = true;
    }

    user.isVerified = user.isEmailVerified || user.isPhoneVerified;
    await userRepository.save(user);

    // Delete OTP from Redis
    if (redisClient) {
      await redisClient.del(key);
    }

    successResponse(res, { user: { id: user.id, isVerified: user.isVerified } }, 'OTP verified successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const resendOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, type } = req.body; // type: 'email' or 'phone'

    if (!type || (!email && !phone)) {
      errorResponse(res, 'Email or phone and type are required', 400);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 10 minute expiration
    const key = `otp:${type}:${email || phone}`;
    if (redisClient) {
      await redisClient.setEx(key, 600, otp); // 10 minutes
    }

    // TODO: Send OTP via email or SMS
    // For now, return OTP in response (REMOVE IN PRODUCTION)
    console.log(`OTP for ${email || phone}: ${otp}`);

    successResponse(res, { otp: process.env.NODE_ENV === 'development' ? otp : undefined }, 'OTP sent successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      errorResponse(res, 'Email is required', 400);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      successResponse(res, {}, 'If the email exists, a password reset link has been sent');
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiration (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour
    await userRepository.save(user);

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    console.log(`Password reset URL: ${resetUrl}`);

    successResponse(
      res,
      { resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined },
      'Password reset link sent to email'
    );
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      errorResponse(res, 'Token and new password are required', 400);
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, 'Password must be at least 6 characters', 400);
      return;
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    if (!user) {
      errorResponse(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Check if token is expired
    if (user.resetPasswordExpire && user.resetPasswordExpire < new Date()) {
      errorResponse(res, 'Reset token has expired', 400);
      return;
    }

    // Update password
    user.password = newPassword; // Will be hashed by @BeforeUpdate hook
    user.resetPasswordToken = null as any;
    user.resetPasswordExpire = null as any;
    await userRepository.save(user);

    successResponse(res, {}, 'Password reset successful');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Logout successful');
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { user: req.user });
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      errorResponse(res, 'Refresh token is required', 400);
      return;
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, true);
    if (!decoded || !decoded.userId) {
      errorResponse(res, 'Invalid refresh token', 401);
      return;
    }

    // Check if user exists and is active
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      errorResponse(res, 'User not found or inactive', 404);
      return;
    }

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    successResponse(res, {
      token: newToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully');
  } catch (error: any) {
    errorResponse(res, 'Invalid or expired refresh token', 401);
  }
};
