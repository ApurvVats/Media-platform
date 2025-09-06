import { Request, Response, NextFunction } from 'express';

// This middleware should be the LAST middleware added in index.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred',
    // In development, you might want to include the stack trace
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
