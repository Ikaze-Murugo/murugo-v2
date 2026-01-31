import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  uploadSingleGeneric,
  uploadMultipleGeneric,
} from '../controllers/upload.controller';

const router = Router();

// Frontend expects POST /upload/image (field: file) and POST /upload/multiple (field: files)
router.post('/image', authenticate, upload.single('file'), uploadSingleGeneric);
router.post('/multiple', authenticate, upload.array('files', 10), uploadMultipleGeneric);

export default router;
