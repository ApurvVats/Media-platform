import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Extend Express's Request interface to include the user payload
export interface AuthRequest extends Request {
  user?: { id: string };
}
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = decoded; // Attach user ID to the request object
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};