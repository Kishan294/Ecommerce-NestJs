import { memoryStorage } from 'multer';

/**
 * Configuration options for Multer to store uploaded files in memory.
 * Includes a file size limit and a basic image type filter.
 */
export const multerMemoryOptions = {
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB limit
  },
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
  storage: memoryStorage(), // Keep files in memory
};