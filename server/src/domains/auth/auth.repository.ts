import { eq } from 'drizzle-orm';
import { dbClient } from '../../lib/db';
import { users } from '../../db/schema';
import { User } from './auth.types';

export interface IAuthRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}

export class AuthRepository implements IAuthRepository {
  private static instance: AuthRepository;

  public static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }

  async findById(id: string): Promise<User | null> {
    const result = await dbClient.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await dbClient.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result || null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await dbClient
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }
} 