// apps/backend/src/middlewares/upload.middleware.ts

import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
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
  limits: { files: 1, fields: 10, parts: 12, fieldSize: 64 * 1024, fileSize: MAX_IMAGE_SIZE },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
});

/**
 * Document upload middleware
 */
export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { files: 1, fields: 10, parts: 12, fieldSize: 64 * 1024, fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: createFileFilter([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]),
});

/**
 * Audio upload middleware
 */
export const uploadAudio = multer({
  storage: memoryStorage,
  limits: { files: 1, fields: 10, parts: 12, fieldSize: 64 * 1024, fileSize: MAX_AUDIO_SIZE },
  fileFilter: createFileFilter(ALLOWED_AUDIO_TYPES),
});

/**
 * Video upload middleware
 */
export const uploadVideo = multer({
  storage: memoryStorage,
  limits: { files: 1, fields: 10, parts: 12, fieldSize: 64 * 1024, fileSize: MAX_VIDEO_SIZE },
  fileFilter: createFileFilter(ALLOWED_VIDEO_TYPES),
});

/**
 * Generic file upload middleware (any type)
 */
export const uploadFile = multer({
  storage: memoryStorage,
  limits: { files: 1, fields: 10, parts: 12, fieldSize: 64 * 1024, fileSize: MAX_VIDEO_SIZE },
});

/**
 * Generate unique filename
 */
export function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  return `${randomUUID()}${ext}`;
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

  let pipeline = sharp(file.buffer, { limitInputPixels: 25_000_000 }).resize(maxWidthOrHeight, maxWidthOrHeight, {
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

// Bounded signatures for the supported formats only. No generic container parser.
function detectUpload(bytes: Buffer): { mime: string; ext: string } | undefined {
  const starts = (signature: number[]) => bytes.length >= signature.length && signature.every((value, i) => bytes[i] === value);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png' };
  if (starts([0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg' };
  if (['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) return { mime: 'image/gif', ext: 'gif' };
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF') {
    const kind = bytes.subarray(8, 12).toString('ascii');
    if (kind === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
    if (kind === 'WAVE') return { mime: 'audio/wav', ext: 'wav' };
  }
  if (bytes.length >= 27 && bytes.subarray(0, 4).toString('ascii') === 'OggS') return { mime: 'audio/ogg', ext: 'ogg' };
  if (bytes.length >= 10 && (bytes.subarray(0, 3).toString('ascii') === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))) return { mime: 'audio/mpeg', ext: 'mp3' };
  if (starts([0x1a, 0x45, 0xdf, 0xa3]) && bytes.subarray(0, 256).includes(Buffer.from('webm'))) return { mime: 'audio/webm', ext: 'webm' };
  return undefined;
}

/** Detect file signatures, reject spoofed MIME, and normalize filename before storage. */
export function validateUploadContent(kind: 'image' | 'audio') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) throw new AppError('Arquivo obrigatório', 400, 'FILE_REQUIRED');
      const detected = detectUpload(req.file.buffer);
      const allowed = kind === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
      const supplied = req.file.mimetype.replace('image/jpg', 'image/jpeg').replace('audio/mp3', 'audio/mpeg');
      const detectedMime = detected?.mime;
      if (!detected || !detectedMime || !allowed.includes(detectedMime) || supplied !== detectedMime) {
        throw new AppError('Conteúdo do arquivo inválido', 400, 'INVALID_FILE_CONTENT');
      }
      req.file.mimetype = detectedMime;
      req.file.originalname = `${randomUUID()}.${detected.ext}`;
      if (kind === 'image') req.file = await compressImage(req.file);
      next();
    } catch { next(new AppError('Conteúdo do arquivo inválido', 400, 'INVALID_FILE_CONTENT')); }
  };
}
