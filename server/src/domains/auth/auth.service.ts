import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../../config';
import { AuthenticationError } from '../../lib/errors';
import { AuthRepository } from './auth.repository';
import { User, AuthResponse, registerSchema, loginSchema } from './auth.types';
import { IAuthRepository } from './auth.repository';

export interface IAuthService {
  register(data: z.infer<typeof registerSchema>): Promise<AuthResponse>;
  login(data: z.infer<typeof loginSchema>): Promise<AuthResponse>;
  verifyToken(token: string): Promise<User>;
  generateToken(user: User): string;
}

export class AuthService implements IAuthService {
  private static instance: AuthService;
  private repository: IAuthRepository;

  private constructor() {
    this.repository = AuthRepository.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(data: z.infer<typeof registerSchema>): Promise<AuthResponse> {
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new AuthenticationError('Email already registered');
    }

    const hashedPassword = await this.hashPassword(data.password);
    const user = await this.repository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name ?? null,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(data: z.infer<typeof loginSchema>): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(data.email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await this.verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      const user = await this.repository.findById(decoded.id);
      if (!user) {
        throw new AuthenticationError('Invalid token');
      }
      return user;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }
} 