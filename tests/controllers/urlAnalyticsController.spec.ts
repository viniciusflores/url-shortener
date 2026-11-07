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

const createClick = (shortener_url_id: string, createdAt: string) =>
  prisma.clickEvent.create({
    data: { shortener_url_id, createdAt: new Date(createdAt) },
  });

describe('URL Analytics Controller - Integration Tests', () => {
  const alias = 'analytics-alias';
  let ownerToken: string;
  let otherToken: string;

  beforeEach(async () => {
    const owner = await createUserWithToken('owner@example.com');
    const other = await createUserWithToken('other@example.com');
    ownerToken = owner.token;
    otherToken = other.token;

    await prisma.urlShortener.create({
      data: {
        original_url: 'https://www.example.com',
        hashed_url: alias,
        userId: owner.user.id,
        expiresAt: getExpiryDatePlusTwoYears(),
      },
    });

    await createClick(alias, '2026-11-01T10:00:00.000Z');
    await createClick(alias, '2026-11-01T20:00:00.000Z');
    await createClick(alias, '2026-11-03T08:00:00.000Z');
  });

  describe('GET /me/urls/:hash/analytics', () => {
    it('should return 401 without token', async () => {
      await request(app).get(`/me/urls/${alias}/analytics`).expect(401);
    });

    it('should return clicks grouped by day', async () => {
      const response = await request(app)
        .get(`/me/urls/${alias}/analytics`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toEqual({
        hash: alias,
        totalClicks: 3,
        clicksByDay: [
          { date: '2026-11-01', clicks: 2 },
          { date: '2026-11-03', clicks: 1 },
        ],
      });
    });

    it('should filter clicks by date range', async () => {
      const response = await request(app)
        .get(`/me/urls/${alias}/analytics?from=2026-11-01&to=2026-11-01`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.totalClicks).toBe(2);
      expect(response.body.clicksByDay).toEqual([
        { date: '2026-11-01', clicks: 2 },
      ]);
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get(`/me/urls/${alias}/analytics?from=01-11-2026`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(400);

      expect(response.body.message).toBe(
        'Invalid from date, expected YYYY-MM-DD',
      );
    });

    it('should return 400 when from is after to', async () => {
      const response = await request(app)
        .get(`/me/urls/${alias}/analytics?from=2026-11-03&to=2026-11-01`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(400);

      expect(response.body.message).toBe('from date must be before to date');
    });

    it('should return 400 when from is sent more than once', async () => {
      const response = await request(app)
        .get(`/me/urls/${alias}/analytics?from=2026-11-01&from=2026-11-02`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(400);

      expect(response.body.message).toBe('Bad Request: Invalid from parameter');
    });

    it('should return 404 for url of another user', async () => {
      const response = await request(app)
        .get(`/me/urls/${alias}/analytics`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.message).toBe('Url not found');
    });

    it('should return 404 for non-existent url', async () => {
      await request(app)
        .get('/me/urls/does-not-exist/analytics')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });
});
