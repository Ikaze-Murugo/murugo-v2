import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/connection';
import { PropertyMedia, MediaType } from '../models/PropertyMedia.model';
import { Property } from '../models/Property.model';
import { Profile } from '../models/Profile.model';
import { successResponse, errorResponse } from '../utils/response.util';
import cloudinary, { uploadImage, uploadMultipleImages, deleteImage } from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * Helper function to convert buffer to stream
 */
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * Helper function to upload buffer to Cloudinary
 */
const uploadBufferToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload property images
 */
export const uploadPropertyImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const userId = req.user?.id;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!files || files.length === 0) {
      errorResponse(res, 'No files uploaded', 400);
      return;
    }

    // Check if property exists and user is the owner
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to upload images for this property', 403);
      return;
    }

    // Upload images to Cloudinary
    const uploadPromises = files.map((file) =>
      uploadBufferToCloudinary(file.buffer, `rwanda-real-estate/properties/${propertyId}`)
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Save media records to database
    const mediaRepository = AppDataSource.getRepository(PropertyMedia);
    const mediaRecords = uploadResults.map((result, index) =>
      mediaRepository.create({
        propertyId,
        url: result.secure_url,
        mediaType: result.resource_type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
        order: index,
      })
    );

    await mediaRepository.save(mediaRecords);

    successResponse(res, { media: mediaRecords }, 'Images uploaded successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Delete property image
 */
export const deletePropertyImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, mediaId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    // Check if property exists and user is the owner
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to delete images for this property', 403);
      return;
    }

    // Get media record
    const mediaRepository = AppDataSource.getRepository(PropertyMedia);
    const media = await mediaRepository.findOne({
      where: { id: mediaId, propertyId },
    });

    if (!media) {
      errorResponse(res, 'Media not found', 404);
      return;
    }

    // Delete from Cloudinary (extract public_id from URL)
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}.{format}
    const publicId = media.url.split('/').slice(-1)[0].split('.')[0];
    await deleteImage(publicId);

    // Delete from database
    await mediaRepository.remove(media);

    successResponse(res, {}, 'Image deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Set primary image
 */
export const setPrimaryImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, mediaId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    // Check if property exists and user is the owner
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    if (property.listerId !== userId && req.user?.role !== 'admin') {
      errorResponse(res, 'You are not authorized to modify images for this property', 403);
      return;
    }

    const mediaRepository = AppDataSource.getRepository(PropertyMedia);

    // Set selected image as first (order 0) and shift others
    const media = await mediaRepository.findOne({ where: { id: mediaId, propertyId } });
    if (!media) {
      errorResponse(res, 'Media not found', 404);
      return;
    }
    
    // Set this media to order 0
    const result = await mediaRepository.update({ id: mediaId, propertyId }, { order: 0 });

    if (result.affected === 0) {
      errorResponse(res, 'Media not found', 404);
      return;
    }

    successResponse(res, {}, 'Primary image set successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Upload profile avatarUrl
 */
export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      errorResponse(res, 'User not authenticated', 401);
      return;
    }

    if (!file) {
      errorResponse(res, 'No file uploaded', 400);
      return;
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(file.buffer, `rwanda-real-estate/avatarUrls/${userId}`);

    // Update profile with new avatarUrl URL
    const profileRepository = AppDataSource.getRepository(Profile);
    let profile = await profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = profileRepository.create({
        userId,
        avatarUrl: result.secure_url,
      });
    } else {
      // Delete old avatarUrl from Cloudinary if exists
      if (profile.avatarUrl) {
        try {
          const publicId = profile.avatarUrl.split('/').slice(-2).join('/').split('.')[0];
          await deleteImage(publicId);
        } catch (error) {
          console.error('Failed to delete old avatarUrl:', error);
        }
      }
      profile.avatarUrl = result.secure_url;
    }

    await profileRepository.save(profile);

    successResponse(res, { avatarUrl: result.secure_url }, 'Avatar uploaded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};
