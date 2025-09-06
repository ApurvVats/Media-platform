import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

// --- EXISTING FUNCTIONS ---
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.signupUser(req.body);
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (e) {
    next(e);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: 'Login successful', user });
  } catch (e) {
    next(e);
  }
};

// --- ADD THESE NEW FUNCTIONS ---
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.handleForgotPassword(req.body.email);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.handleResetPassword(req.body);
    res.json({ message: "Password has been reset successfully." });
  } catch (e) {
    next(e);
  }
};

export const logout = (req: Request, res: Response) => {
  // Clear the JWT cookie
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Set the cookie to expire immediately
  });
  res.status(200).json({ message: 'Logged out successfully' });
};