import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { Property, PropertyStatus, TransactionType } from '../models/Property.model';
import { PropertyMedia, MediaType } from '../models/PropertyMedia.model';
import { PropertyView } from '../models/PropertyView.model';
import { User } from '../models/User.model';
import { successResponse, errorResponse } from '../utils/response.util';
import { Like, Between, In, MoreThanOrEqual, LessThanOrEqual, Brackets } from 'typeorm';

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      title,
      propertyType,
      transactionType,
      location,
      price,
      currency,
      description,
      amenities,
      bedrooms,
      bathrooms,
      sizeSqm,
    } = req.body;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!title || !propertyType || !location || !price) {
      errorResponse(res, 'Title, propertyType, location, and price are required', 400);
      return;
    }

    const normalizedLocation = {
      district: location.district,
      sector: location.sector,
      cell: location.cell ?? '',
      address: location.address,
      latitude: location.latitude != null && !Number.isNaN(Number(location.latitude)) ? Number(location.latitude) : 0,
      longitude: location.longitude != null && !Number.isNaN(Number(location.longitude)) ? Number(location.longitude) : 0,
    };

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = propertyRepository.create({
      listerId: userId,
      title,
      propertyType,
      transactionType: transactionType ?? TransactionType.RENT,
      location: normalizedLocation,
      price,
      currency: currency ?? 'RWF',
      description: description ?? '',
      amenities: Array.isArray(amenities) ? amenities : [],
      bedrooms,
      bathrooms,
      sizeSqm,
      // New properties start as pending so they can be reviewed by an admin
      status: PropertyStatus.PENDING,
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
      transactionType,
      minPrice,
      maxPrice,
      location: locationFilter,
      bedrooms,
      bathrooms,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
    } = req.query;

    const propertyRepository = AppDataSource.getRepository(Property);
    const skip = (Number(page) - 1) * Number(limit);
    const order = (sortBy as string) || 'createdAt';
    const orderDir = ((sortOrder as string) || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.lister', 'lister')
      .leftJoinAndSelect('lister.profile', 'profile')
      .leftJoinAndSelect('property.media', 'media')
      .where('property.status = :status', { status: PropertyStatus.AVAILABLE });

    if (type) {
      qb.andWhere('property.propertyType = :type', { type });
    }

    if (transactionType && typeof transactionType === 'string' && ['rent', 'sale', 'lease'].includes(transactionType)) {
      qb.andWhere('property.transactionType = :transactionType', { transactionType });
    }

    if (minPrice != null && minPrice !== '') {
      qb.andWhere('property.price >= :minPrice', { minPrice: Number(minPrice) });
    }
    if (maxPrice != null && maxPrice !== '') {
      qb.andWhere('property.price <= :maxPrice', { maxPrice: Number(maxPrice) });
    }

    if (locationFilter && typeof locationFilter === 'string' && locationFilter.trim()) {
      const locTerm = `%${locationFilter.trim()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where("property.location->>'district' ILIKE :locTerm", { locTerm })
            .orWhere("property.location->>'sector' ILIKE :locTerm", { locTerm })
            .orWhere("property.location->>'cell' ILIKE :locTerm", { locTerm })
            .orWhere("property.location->>'address' ILIKE :locTerm", { locTerm });
        })
      );
    }

    if (bedrooms != null && bedrooms !== '') {
      qb.andWhere('property.bedrooms >= :bedrooms', { bedrooms: Number(bedrooms) });
    }
    if (bathrooms != null && bathrooms !== '') {
      qb.andWhere('property.bathrooms >= :bathrooms', { bathrooms: Number(bathrooms) });
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('property.title ILIKE :searchTerm', { searchTerm })
            .orWhere("property.location->>'district' ILIKE :searchTerm", { searchTerm })
            .orWhere("property.location->>'sector' ILIKE :searchTerm", { searchTerm })
            .orWhere("property.location->>'cell' ILIKE :searchTerm", { searchTerm })
            .orWhere("property.location->>'address' ILIKE :searchTerm", { searchTerm });
        })
      );
    }

    qb.orderBy(`property.${order}`, orderDir).skip(skip).take(Number(limit));

    const [properties, total] = await qb.getManyAndCount();

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

/**
 * Add media (images) to a property by URLs.
 * Used after create when images were uploaded via /upload/multiple.
 */
export const addPropertyMediaByUrls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: propertyId } = req.params;
    const { urls } = req.body as { urls?: string[] };
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      errorResponse(res, 'urls array is required and must not be empty', 400);
      return;
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to add media to this property', 403);
      return;
    }

    const mediaRepository = AppDataSource.getRepository(PropertyMedia);
    const existingCount = await mediaRepository.count({ where: { propertyId } });
    const mediaRecords = urls
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
      .map((url, index) =>
        mediaRepository.create({
          propertyId,
          url,
          mediaType: MediaType.IMAGE,
          order: existingCount + index,
        })
      );

    if (mediaRecords.length === 0) {
      errorResponse(res, 'No valid URLs provided', 400);
      return;
    }

    await mediaRepository.save(mediaRecords);

    successResponse(res, { media: mediaRecords }, 'Media added successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to add media', 500);
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
    const { status } = req.body as { status?: PropertyStatus | string };
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    // Ensure provided status is one of the allowed enum values
    const allowedStatuses = Object.values(PropertyStatus);
    if (!status || typeof status !== 'string' || !allowedStatuses.includes(status as PropertyStatus)) {
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

    // At this point, status is a valid PropertyStatus string
    property.status = status as PropertyStatus;
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
        // Use the numeric counter stored on the property entity
        totalViews: property.viewsCount || 0,
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
