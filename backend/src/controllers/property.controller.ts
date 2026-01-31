import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { Property, PropertyStatus, TransactionType } from '../models/Property.model';
import { PropertyMedia } from '../models/PropertyMedia.model';
import { PropertyView } from '../models/PropertyView.model';
import { User } from '../models/User.model';
import { successResponse, errorResponse } from '../utils/response.util';
import { Like, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      name,
      type,
      location,
      price,
      description,
      amenities,
      bedrooms,
      bathrooms,
      area,
      latitude,
      longitude,
    } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    // Validate required fields
    if (!name || !type || !location || !price) {
      errorResponse(res, 'Name, type, location, and price are required', 400);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = propertyRepository.create({
      listerId: userId,
      title: name,
      propertyType: type,
      transactionType: TransactionType.RENT, // Default, should come from request
      location,
      price,
      description,
      amenities,
      bedrooms,
      bathrooms,
      sizeSqm: area,
      status: PropertyStatus.AVAILABLE,
    });

    await propertyRepository.save(property);

    successResponse(res, { property }, 'Property created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getAllProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      minPrice,
      maxPrice,
      location,
      bedrooms,
      bathrooms,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
    } = req.query;

    const propertyRepository = AppDataSource.getRepository(Property);
    const skip = (Number(page) - 1) * Number(limit);

    // Build query conditions
    const where: any = { status: PropertyStatus.AVAILABLE };

    if (type) {
      where.propertyType = type;
    }

    if (minPrice && maxPrice) {
      where.price = Between(Number(minPrice), Number(maxPrice));
    } else if (minPrice) {
      where.price = MoreThanOrEqual(Number(minPrice));
    } else if (maxPrice) {
      where.price = LessThanOrEqual(Number(maxPrice));
    }

    if (location) {
      where.location = Like(`%${location}%`);
    }

    if (bedrooms) {
      where.bedrooms = Number(bedrooms);
    }

    if (bathrooms) {
      where.bathrooms = Number(bathrooms);
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    // Get properties with pagination
    const [properties, total] = await propertyRepository.findAndCount({
      where,
      relations: ['lister', 'lister.profile', 'media'],
      order: { [sortBy as string]: sortOrder as 'ASC' | 'DESC' },
      skip,
      take: Number(limit),
    });

    // Remove sensitive data from lister
    const sanitizedProperties = properties.map((property) => ({
      ...property,
      lister: {
        id: property.lister.id,
        email: property.lister.email,
        phone: property.lister.phone,
        whatsappNumber: property.lister.whatsappNumber,
        profileType: property.lister.profileType,
        profile: property.lister.profile,
      },
    }));

    successResponse(res, {
      properties: sanitizedProperties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Properties fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getFeaturedProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const propertyRepository = AppDataSource.getRepository(Property);
    const skip = (Number(page) - 1) * Number(limit);

    // Get properties with most views (featured)
    const [properties, total] = await propertyRepository.findAndCount({
      where: { status: PropertyStatus.AVAILABLE },
      relations: ['lister', 'lister.profile', 'media'],
      order: { viewsCount: 'DESC', createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });

    successResponse(res, {
      properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'Featured properties fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
      relations: ['lister', 'lister.profile', 'media', 'reviews', 'reviews.reviewer', 'reviews.reviewer.profile'],
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // Track property view
    if (userId && userId !== property.listerId) {
      const viewRepository = AppDataSource.getRepository(PropertyView);
      const existingView = await viewRepository.findOne({
        where: { propertyId: id, userId },
      });

      if (!existingView) {
        const view = viewRepository.create({
          propertyId: id,
          userId,
        });
        await viewRepository.save(view);

        // Increment views count
        property.viewsCount = (property.viewsCount || 0) + 1;
        await propertyRepository.save(property);
      }
    }

    // Remove sensitive data from lister
    const sanitizedProperty = {
      ...property,
      lister: {
        id: property.lister.id,
        email: property.lister.email,
        phone: property.lister.phone,
        whatsappNumber: property.lister.whatsappNumber,
        profileType: property.lister.profileType,
        profile: property.lister.profile,
      },
    };

    successResponse(res, { property: sanitizedProperty }, 'Property fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // Check if user is the owner or admin
    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to update this property', 403);
      return;
    }

    // Update property fields
    Object.assign(property, updateData);
    await propertyRepository.save(property);

    successResponse(res, { property }, 'Property updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // Check if user is the owner or admin
    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to delete this property', 403);
      return;
    }

    // Soft delete: set status to pending (or you could add INACTIVE to enum)
    property.status = PropertyStatus.PENDING;
    await propertyRepository.save(property);

    successResponse(res, {}, 'Property deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getMyListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { listerId: userId };
    if (status) {
      where.status = status;
    }

    const [properties, total] = await propertyRepository.findAndCount({
      where,
      relations: ['media'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(limit),
    });

    successResponse(res, {
      properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, 'My listings fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const updatePropertyStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!status || !['active', 'inactive', 'sold', 'rented'].includes(status)) {
      errorResponse(res, 'Invalid status', 400);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // Check if user is the owner or admin
    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to update this property status', 403);
      return;
    }

    property.status = status;
    await propertyRepository.save(property);

    successResponse(res, { property }, 'Property status updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const getPropertyAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // Check if user is the owner or admin
    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to view this property analytics', 403);
      return;
    }

    // Get view count
    const viewRepository = AppDataSource.getRepository(PropertyView);
    const viewCount = await viewRepository.count({
      where: { propertyId: id },
    });

    // TODO: Add more analytics (favorites, inquiries, shares, etc.)

    successResponse(res, {
      analytics: {
        views: viewCount,
        totalViews: property.views || 0,
        // Add more analytics as needed
      },
    }, 'Property analytics fetched successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const recordView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // Track property view
    if (userId && userId !== property.listerId) {
      const viewRepository = AppDataSource.getRepository(PropertyView);
      const existingView = await viewRepository.findOne({
        where: { propertyId: id, userId },
      });

      if (!existingView) {
        const view = viewRepository.create({
          propertyId: id,
          userId,
        });
        await viewRepository.save(view);

        // Increment views count
        property.viewsCount = (property.viewsCount || 0) + 1;
        await propertyRepository.save(property);
      }
    }

    successResponse(res, {}, 'View recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const recordContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // TODO: Implement contact tracking logic
    // For now, just return success

    successResponse(res, {}, 'Contact recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

export const recordShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { platform } = req.body;

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    // TODO: Implement share tracking logic
    // For now, just return success

    successResponse(res, {}, 'Share recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
