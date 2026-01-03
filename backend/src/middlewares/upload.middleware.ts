// apps/backend/src/middlewares/upload.middleware.ts

import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
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
