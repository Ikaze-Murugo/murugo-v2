import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload image to Cloudinary
 * @param file - File buffer or path
 * @param folder - Folder name in Cloudinary
 * @returns Upload result with URL
 */
export const uploadImage = async (file: string | Buffer, folder: string = 'rwanda-real-estate'): Promise<any> => {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file buffers or paths
 * @param folder - Folder name in Cloudinary
 * @returns Array of upload results
 */
export const uploadMultipleImages = async (files: (string | Buffer)[], folder: string = 'rwanda-real-estate'): Promise<any[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Failed to upload images: ${error}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image
 * @returns Deletion result
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs
 * @returns Deletion result
 */
export const deleteMultipleImages = async (publicIds: string[]): Promise<any> => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete images: ${error}`);
  }
};
