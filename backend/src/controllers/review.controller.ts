import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { Review } from '../models/Review.model';
import { Property } from '../models/Property.model';
import { User } from '../models/User.model';
import { successResponse, errorResponse } from '../utils/response.util';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { propertyId, revieweeId, rating, comment, type } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      errorResponse(res, 'Rating must be between 1 and 5', 400);
      return;
    }

    const reviewRepository = AppDataSource.getRepository(Review);
    const review = reviewRepository.create({
      reviewerId: userId,
      propertyId,
      revieweeId,
      rating,
      comment,
    });

    await reviewRepository.save(review);

    successResponse(res, { review }, 'Review created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getPropertyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const reviewRepository = AppDataSource.getRepository(Review);
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await reviewRepository.findAndCount({
      where: { propertyId },
      relations: ['reviewer', 'reviewer.profile'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });

    successResponse(res, {
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Property reviews fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const reviewRepository = AppDataSource.getRepository(Review);
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await reviewRepository.findAndCount({
      where: { revieweeId: userId },
      relations: ['reviewer', 'reviewer.profile'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });

    successResponse(res, {
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'User reviews fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { rating, comment } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      errorResponse(res, 'Review not found', 404);
      return;
    }

    if (review.reviewerId !== userId) {
      errorResponse(res, 'You are not authorized to update this review', 403);
      return;
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await reviewRepository.save(review);

    successResponse(res, { review }, 'Review updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      errorResponse(res, 'Review not found', 404);
      return;
    }

    if (review.reviewerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to delete this review', 403);
      return;
    }

    await reviewRepository.remove(review);

    successResponse(res, {}, 'Review deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
