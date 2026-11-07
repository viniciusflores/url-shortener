import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import { signToken } from '../../src/lib/jwt';
import { getExpiryDatePlusTwoYears } from '../../src/lib/date/utils';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const createUserWithToken = async (email: string) => {
  const user = await prisma.user.create({
    data: { email, password_hashed: 'hashed' },
  });
  return { user, token: signToken({ userId: user.id, email: user.email }) };
};

const createUrl = (hashed_url: string, userId: string | null) =>
  prisma.urlShortener.create({
    data: {
      original_url: `https://www.example.com/${hashed_url}`,
      hashed_url,
      userId,
      expiresAt: getExpiryDatePlusTwoYears(),
    },
  });

describe('URL Management Controller - Integration Tests', () => {
  let ownerToken: string;
  let otherToken: string;

  beforeEach(async () => {
    const owner = await createUserWithToken('owner@example.com');
    const other = await createUserWithToken('other@example.com');
    ownerToken = owner.token;
    otherToken = other.token;

    await createUrl('owner-alias', owner.user.id);
    await createUrl('other-alias', other.user.id);
    await createUrl('anonymous-hash', null);
  });

  describe('Authentication', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/me/urls').expect(401);
      expect(response.body.error).toBe('Missing or invalid token');
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/me/urls')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /me/urls', () => {
    it('should return only urls of the logged user', async () => {
      const response = await request(app)
        .get('/me/urls')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].hashed_url).toBe('owner-alias');
    });
  });

  describe('GET /me/urls/:hash', () => {
    it('should return url of the logged user', async () => {
      const response = await request(app)
        .get('/me/urls/owner-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          hashed_url: 'owner-alias',
          original_url: 'https://www.example.com/owner-alias',
        }),
      );
    });

    it('should return 404 for url of another user', async () => {
      const response = await request(app)
        .get('/me/urls/other-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);

      expect(response.body.message).toBe('Url not found');
    });
  });

  describe('PATCH /me/urls/:hash', () => {
    it('should update alias of the logged user url', async () => {
      const response = await request(app)
        .patch('/me/urls/owner-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ new_alias: 'new-owner-alias' })
        .expect(200);

      expect(response.body.hashed_url).toBe('new-owner-alias');

      const oldRecord = await prisma.urlShortener.findUnique({
        where: { hashed_url: 'owner-alias' },
      });
      expect(oldRecord).toBeNull();
    });

    it('should return 400 without new_alias', async () => {
      const response = await request(app)
        .patch('/me/urls/owner-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe(
        'Bad Request: Absence of new_alias parameter',
      );
    });

    it('should return 400 when new alias is already taken', async () => {
      const response = await request(app)
        .patch('/me/urls/owner-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ new_alias: 'anonymous-hash' })
        .expect(400);

      expect(response.body.message).toBe('Custom alias already taken');
    });

    it('should return 404 when updating url of another user', async () => {
      await request(app)
        .patch('/me/urls/other-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ new_alias: 'stolen-alias' })
        .expect(404);
    });
  });

  describe('DELETE /me/urls/:hash', () => {
    it('should delete url of the logged user', async () => {
      await request(app)
        .delete('/me/urls/owner-alias')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      const record = await prisma.urlShortener.findUnique({
        where: { hashed_url: 'owner-alias' },
      });
      expect(record).toBeNull();
    });

    it('should return 404 when deleting url of another user', async () => {
      const response = await request(app)
        .delete('/me/urls/owner-alias')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.message).toBe('URL not found for the user');

      const record = await prisma.urlShortener.findUnique({
        where: { hashed_url: 'owner-alias' },
      });
      expect(record).not.toBeNull();
    });
  });
});
