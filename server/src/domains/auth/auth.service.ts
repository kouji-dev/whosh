import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../../config';
import { ValidationError } from '../../lib/errors';
import { AuthRepository } from './auth.repository';
import { User, GoogleProfile, AuthResponse, serviceRegisterSchema, serviceLoginSchema } from './auth.types';
import { IAuthRepository } from './auth.repository';

export interface IAuthService {
  register(data: z.infer<typeof serviceRegisterSchema>): Promise<AuthResponse>;
  login(data: z.infer<typeof serviceLoginSchema>): Promise<AuthResponse>;
  handleGoogleAuth(profile: GoogleProfile): Promise<AuthResponse>;
  verifyToken(token: string): Promise<User>;
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

  async register(data: z.infer<typeof serviceRegisterSchema>): Promise<AuthResponse> {
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
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

  async login(data: z.infer<typeof serviceLoginSchema>): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(data.email);
    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    const isValidPassword = await this.verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async handleGoogleAuth(profile: GoogleProfile): Promise<AuthResponse> {
    let user = await this.repository.findByEmail(profile.email);

    if (!user) {
      user = await this.repository.create({
        email: profile.email,
        name: profile.name,
        password: '', // Google users don't need a password
      });
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      const user = await this.repository.findById(decoded.id);
      if (!user) {
        throw new ValidationError('Invalid token');
      }
      return user;
    } catch (error) {
      throw new ValidationError('Invalid token');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { id: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }
} 