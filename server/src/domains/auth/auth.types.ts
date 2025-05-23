import { z } from 'zod';

// Database types
export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleProfile {
  email: string;
  name: string;
}

// Response types
export interface AuthResponse {
  user: User;
  token: string;
}

// Validation schemas
export const serviceRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const serviceLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const googleAuthSchema = z.object({
  code: z.string(),
  state: z.string(),
}); 