import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import { hashUserPassword } from '../../src/lib/crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

describe('User Auth Controller', () => {
  const username = 'test@gmail.com';
  const password = '123456';

  it('should be possible to register a user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: username, password: password });

    expect(response.status).toBe(200);
    expect(response.text).toContain(`Success auth register to: ${username}`);
  });

  it('should be possible to login a user', async () => {
    const hashedPassword = await hashUserPassword(password);
    await prisma.user.create({
      data: {
        email: username,
        password_hashed: hashedPassword,
      },
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ username: username, password: password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
