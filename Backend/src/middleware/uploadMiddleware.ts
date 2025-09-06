import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Set up disk storage for uploaded files
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Save files to the 'uploads' directory at the root of your project
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer with storage options and file limits
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB file size limit
  }
});
