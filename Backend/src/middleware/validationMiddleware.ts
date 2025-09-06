import { Request, Response, NextFunction } from 'express';
import { z } from 'zod'; // Use z.Schema instead of AnyZodObject

export const validate = (schema: z.Schema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: any) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: e.errors,
    });
  }
};
