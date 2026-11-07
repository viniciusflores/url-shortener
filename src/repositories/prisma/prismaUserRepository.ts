import type { IUserRepository, UserRecord } from '../interfaces/userRepository';
import { prisma } from './prismaClient';

export class PrismaUserRepository implements IUserRepository {
  async create(email: string, password_hashed: string): Promise<UserRecord> {
    const user = await prisma.user.create({
      data: {
        email,
        password_hashed,
      },
    });

    return user;
  }
  async getByEmail(email: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }
  async getById(id: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }
}
