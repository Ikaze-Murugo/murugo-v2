import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|wmv/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');
  const isDoc = allowedDocTypes.test(extname) && (mimetype.includes('pdf') || mimetype.includes('document'));

  if (isImage || isVideo || isDoc) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

// Single file upload
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter,
});

// Multiple files upload (for property images)
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 10, // Maximum 10 files
  },
  fileFilter,
});

// Avatar upload (smaller size limit)
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2097152, // 2MB for avatars
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed for avatars.'));
    }
  },
});
