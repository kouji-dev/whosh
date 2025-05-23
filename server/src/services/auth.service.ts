import { dbClient } from '../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import type { InferSelectModel } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type User = InferSelectModel<typeof users>;

export class AuthService {
  // Register with email and password
  async register(data: z.infer<typeof registerSchema>) {
    const validatedData = registerSchema.parse(data);
    
    // Check if user already exists
    const existingUser = await dbClient.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const [user] = await dbClient.insert(users)
      .values({
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      })
      .returning();

    // Generate JWT
    const token = this.generateToken(user.id);

    return { user, token };
  }

  // Login with email and password
  async login(data: z.infer<typeof loginSchema>) {
    const validatedData = loginSchema.parse(data);

    // Find user
    const user = await dbClient.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = this.generateToken(user.id);

    return { user, token };
  }

  // Handle Google OAuth
  async handleGoogleAuth(profile: { email: string; name?: string }) {
    // Check if user exists
    let user = await dbClient.query.users.findFirst({
      where: eq(users.email, profile.email),
    });

    if (!user) {
      // Create new user
      const [newUser] = await dbClient.insert(users)
        .values({
          email: profile.email,
          name: profile.name,
          password: '', // Empty password for OAuth users
        })
        .returning();
      user = newUser;
    }

    // Generate JWT
    const token = this.generateToken(user.id);

    return { user, token };
  }

  // Generate JWT token
  private generateToken(userId: string): string {
    const payload = { userId };
    const options = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  // Verify JWT token
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await dbClient.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 