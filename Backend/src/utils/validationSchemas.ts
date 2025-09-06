import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const mediaUploadSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    // FIX: Remove the second argument (the errorMap object).
    // The default error message from zod is sufficient and this syntax is correct.
    type: z.enum(['video', 'audio']),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email is required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
