// apps/backend/src/middlewares/upload.middleware.ts

import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import sharp from 'sharp';
import { AppError } from './error.middleware';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Memory storage for processing before uploading to Supabase
const memoryStorage = multer.memoryStorage();

// File filter factory
function createFileFilter(allowedTypes: string[]) {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ): void => {
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new AppError(
          `Tipo de arquivo não permitido: ${file.mimetype}`,
          400,
          'INVALID_FILE_TYPE'
        )
      );
    }
  };
}

/**
 * Image upload middleware
 */
export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
});

/**
 * Document upload middleware
 */
export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: createFileFilter([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]),
});

/**
 * Audio upload middleware
 */
export const uploadAudio = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_AUDIO_SIZE },
  fileFilter: createFileFilter(ALLOWED_AUDIO_TYPES),
});

/**
 * Video upload middleware
 */
export const uploadVideo = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: createFileFilter(ALLOWED_VIDEO_TYPES),
});

/**
 * Generic file upload middleware (any type)
 */
export const uploadFile = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

/**
 * Generate unique filename
 */
export function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Get folder path based on file type
 */
export function getUploadFolder(mimetype: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return 'images';
  }
  if (ALLOWED_AUDIO_TYPES.includes(mimetype)) {
    return 'audio';
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) {
    return 'videos';
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
    return 'documents';
  }
  return 'files';
}

/**
 * Image compression options
 */
export interface CompressImageOptions {
  maxWidthOrHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Compress an uploaded image buffer using sharp.
 * Resizes to a maximum dimension and converts to the target format.
 *
 * @param file - Multer file object (in memory)
 * @param options - Compression options
 * @returns Modified file object with compressed buffer
 */
export async function compressImage(
  file: Express.Multer.File,
  options: CompressImageOptions = {}
): Promise<Express.Multer.File> {
  const { maxWidthOrHeight = 1920, quality = 80, format = 'webp' } = options;

  // Only compress images
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return file;
  }

  let pipeline = sharp(file.buffer).resize(maxWidthOrHeight, maxWidthOrHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 8 });
      break;
  }

  const compressedBuffer = await pipeline.toBuffer();

  return {
    ...file,
    buffer: compressedBuffer,
    size: compressedBuffer.length,
    mimetype: `image/${format}`,
    originalname: path.basename(file.originalname, path.extname(file.originalname)) + `.${format}`,
  };
}

/**
 * Express middleware to compress uploaded images automatically.
 * Compresses the `file` (single) or `files` (array) in req after multer.
 */
export function compressImageMiddleware(options: CompressImageOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.file && ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
        req.file = await compressImage(req.file, options);
      }
      if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        for (const file of files as Express.Multer.File[]) {
          if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            const compressed = await compressImage(file, options);
            Object.assign(file, compressed);
          }
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
