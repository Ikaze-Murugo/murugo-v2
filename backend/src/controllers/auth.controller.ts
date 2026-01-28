import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { User } from '../models/User.model';
import { Profile } from '../models/Profile.model';
import { generateToken, generateRefreshToken } from '../utils/jwt.util';
import { successResponse, errorResponse } from '../utils/response.util';

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
  // Implementation for OTP verification
  successResponse(res, {}, 'OTP verified successfully');
};

export const resendOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  // Implementation for resending OTP
  successResponse(res, {}, 'OTP sent successfully');
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  // Implementation for forgot password
  successResponse(res, {}, 'Password reset link sent to email');
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  // Implementation for reset password
  successResponse(res, {}, 'Password reset successful');
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, {}, 'Logout successful');
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { user: req.user });
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  // Implementation for refresh token
  successResponse(res, {}, 'Token refreshed');
};
