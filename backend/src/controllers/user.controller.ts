import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { User } from '../models/User.model';
import { Profile } from '../models/Profile.model';
import { UserPreference } from '../models/UserPreference.model';
import { Property, PropertyStatus } from '../models/Property.model';
import { successResponse, errorResponse } from '../utils/response.util';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileType: user.profileType,
        whatsappNumber: user.whatsappNumber,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isVerified: user.isVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        profile: user.profile,
      },
    }, 'Profile fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, bio, company, avatarUrl } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const profileRepository = AppDataSource.getRepository(Profile);
    let profile = await profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = profileRepository.create({
        userId,
        name: name ?? '',
        bio: bio ?? null,
        companyName: company ?? null,
        avatarUrl: avatarUrl ?? null,
      });
    } else {
      // Update existing profile
      if (name !== undefined) profile.name = name;
      if (bio !== undefined) profile.bio = bio;
      if (company !== undefined) profile.companyName = company;
    }

    await profileRepository.save(profile);

    successResponse(res, { profile }, 'Profile updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      propertyTypes,
      minPrice,
      maxPrice,
      locations,
      amenities,
      notificationSettings,
    } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const preferencesRepository = AppDataSource.getRepository(UserPreference);
    let preferences = await preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create preferences if they don't exist (model: budgetMin, budgetMax, preferredLocations, requiredAmenities)
      preferences = preferencesRepository.create({
        userId,
        propertyTypes: propertyTypes ?? [],
        budgetMin: minPrice ?? null,
        budgetMax: maxPrice ?? null,
        preferredLocations: locations ?? [],
        requiredAmenities: amenities ?? [],
        surveyResponses: notificationSettings ? { notificationSettings } : undefined,
      });
    } else {
      // Update existing preferences
      if (propertyTypes !== undefined) preferences.propertyTypes = propertyTypes;
      if (minPrice !== undefined) preferences.budgetMin = minPrice;
      if (maxPrice !== undefined) preferences.budgetMax = maxPrice;
      if (locations !== undefined) preferences.preferredLocations = locations;
      if (amenities !== undefined) preferences.requiredAmenities = amenities;
      if (notificationSettings !== undefined) preferences.surveyResponses = { ...(preferences.surveyResponses || {}), notificationSettings };
    }

    await preferencesRepository.save(preferences);

    successResponse(res, { preferences }, 'Preferences updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const preferencesRepository = AppDataSource.getRepository(UserPreference);
    const preferences = await preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences if none exist (API-friendly names)
      successResponse(res, {
        preferences: {
          propertyTypes: [],
          minPrice: null,
          maxPrice: null,
          locations: [],
          amenities: [],
          notificationSettings: {},
        },
      }, 'No preferences found');
      return;
    }

    // Map model fields to API-friendly names for frontend

    successResponse(res, {
      preferences: {
        ...preferences,
        minPrice: preferences.budgetMin,
        maxPrice: preferences.budgetMax,
        locations: preferences.preferredLocations,
        amenities: preferences.requiredAmenities,
        notificationSettings: (preferences.surveyResponses as Record<string, unknown>)?.notificationSettings ?? {},
      },
    }, 'Preferences fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const submitSurvey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const surveyData = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    // Extract preference data from survey
    const {
      propertyTypes,
      priceRange,
      preferredLocations,
      mustHaveAmenities,
      notificationPreferences,
    } = surveyData;

    const preferencesRepository = AppDataSource.getRepository(UserPreference);
    let preferences = await preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = preferencesRepository.create({
        userId,
        propertyTypes: propertyTypes || [],
        budgetMin: priceRange?.min ?? null,
        budgetMax: priceRange?.max ?? null,
        preferredLocations: preferredLocations || [],
        requiredAmenities: mustHaveAmenities || [],
        surveyResponses: notificationPreferences ? { notificationSettings: notificationPreferences } : undefined,
      });
    } else {
      preferences.propertyTypes = propertyTypes || preferences.propertyTypes;
      preferences.budgetMin = priceRange?.min ?? preferences.budgetMin;
      preferences.budgetMax = priceRange?.max ?? preferences.budgetMax;
      preferences.preferredLocations = preferredLocations || preferences.preferredLocations;
      preferences.requiredAmenities = mustHaveAmenities || preferences.requiredAmenities;
      if (notificationPreferences !== undefined) {
        preferences.surveyResponses = { ...(preferences.surveyResponses || {}), notificationSettings: notificationPreferences };
      }
    }

    await preferencesRepository.save(preferences);

    successResponse(res, { preferences }, 'Survey submitted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getUserStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);

    // Get user's properties count
    const propertiesCount = await propertyRepository.count({
      where: { listerId: userId },
    });

    // Get active (available) properties count
    const activePropertiesCount = await propertyRepository.count({
      where: { listerId: userId, status: PropertyStatus.AVAILABLE },
    });

    // TODO: Add more statistics (views, favorites, messages, etc.)

    successResponse(res, {
      statistics: {
        totalProperties: propertiesCount,
        activeProperties: activePropertiesCount,
        inactiveProperties: propertiesCount - activePropertiesCount,
        // Add more stats as needed
      },
    }, 'Statistics fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!password) {
      errorResponse(res, 'Password is required to delete account', 400);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      errorResponse(res, 'Invalid password', 401);
      return;
    }

    // Soft delete: deactivate account instead of deleting
    user.isActive = false;
    await userRepository.save(user);

    // TODO: Optionally, delete or anonymize user data

    successResponse(res, {}, 'Account deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!currentPassword || !newPassword) {
      errorResponse(res, 'Current password and new password are required', 400);
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, 'New password must be at least 6 characters', 400);
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      errorResponse(res, 'Current password is incorrect', 401);
      return;
    }

    // Update password
    user.password = newPassword; // Will be hashed by @BeforeUpdate hook
    await userRepository.save(user);

    successResponse(res, {}, 'Password updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
