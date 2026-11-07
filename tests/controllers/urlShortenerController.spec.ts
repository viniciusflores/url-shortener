import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import { signToken } from '../../src/lib/jwt';
import { PrismaClickEventRepository } from '../../src/repositories/prisma/prismaEventClickRepository';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

describe('URL Shortener Controller - Integration Tests', () => {
  beforeEach(async () => {
    await prisma.urlShortener.deleteMany({});
  });

  afterEach(async () => {
    await prisma.urlShortener.deleteMany({});
  });

  describe('POST /url/', () => {
    it('should create a shortened URL for valid input', async () => {
      const originalUrl = 'https://www.example.com';

      const response = await request(app)
        .post('/url/')
        .send({ original_url: originalUrl })
        .expect(200);

      expect(response.body).toHaveProperty('shortened_url');
      // Updated expectation to check for the base URL in the response
      expect(response.body.shortened_url).toContain(
        process.env.BASE_URL || 'http://localhost:3000',
      );
    });

    it('should redirect to original URL when accessing shortened URL', async () => {
      const originalUrl = 'https://www.example.com';
      const createResponse = await request(app)
        .post('/url/')
        .send({ original_url: originalUrl })
        .expect(200);

      const shortUrl = createResponse.body.shortened_url;
      const hash = shortUrl.split('/').pop();

      const redirectResponse = await request(app)
        .get(`/url/${hash}`)
        .expect(302);

      expect(redirectResponse.headers.location).toBe(originalUrl);
    });
  });

  describe('GET /url/:hash', () => {
    it('should return 404 for non-existent hash', async () => {
      await request(app).get('/url/nonexistent').expect(404);
    });

    it('should register a click event when accessing shortened URL', async () => {
      const createResponse = await request(app)
        .post('/url/')
        .send({ original_url: 'https://www.example.com/click' })
        .expect(200);
      const hash = createResponse.body.shortened_url.split('/').pop();

      await request(app)
        .get(`/url/${hash}`)
        .set('User-Agent', 'Chrome 123')
        .expect(302);

      await vi.waitFor(async () => {
        const clicks = await prisma.clickEvent.findMany({
          where: { shortener_url_id: hash },
        });
        expect(clicks).toHaveLength(1);
        expect(clicks[0].userAgent).toBe('Chrome 123');
      });
    });

    it('should still redirect when registering the click event fails', async () => {
      const originalUrl = 'https://www.example.com/analytics-down';
      const createResponse = await request(app)
        .post('/url/')
        .send({ original_url: originalUrl })
        .expect(200);
      const hash = createResponse.body.shortened_url.split('/').pop();

      vi.spyOn(
        PrismaClickEventRepository.prototype,
        'create',
      ).mockRejectedValueOnce(new Error('db down'));

      const response = await request(app).get(`/url/${hash}`).expect(302);
      expect(response.headers.location).toBe(originalUrl);
    });
  });

  describe('POST /url/custom', () => {
    let token: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: { email: 'custom@example.com', password_hashed: 'hashed' },
      });
      token = signToken({ userId: user.id, email: user.email });
    });

    it('should return 401 without token', async () => {
      await request(app)
        .post('/url/custom')
        .send({
          original_url: 'https://www.example.com',
          custom_alias: 'my-alias',
        })
        .expect(401);
    });

    it('should create a custom shortened URL', async () => {
      const response = await request(app)
        .post('/url/custom')
        .set('Authorization', `Bearer ${token}`)
        .send({
          original_url: 'https://www.example.com',
          custom_alias: 'my-alias',
        })
        .expect(200);

      expect(response.body.shortened_url).toMatch(/\/url\/my-alias$/);
    });

    it('should return 400 without custom_alias', async () => {
      const response = await request(app)
        .post('/url/custom')
        .set('Authorization', `Bearer ${token}`)
        .send({ original_url: 'https://www.example.com' })
        .expect(400);

      expect(response.body.message).toBe(
        'Bad Request: Absence of custom_alias parameter',
      );
    });

    it('should return 400 for reserved custom alias', async () => {
      const response = await request(app)
        .post('/url/custom')
        .set('Authorization', `Bearer ${token}`)
        .send({
          original_url: 'https://www.example.com',
          custom_alias: 'admin',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid custom alias');
    });

    it('should return 400 when custom alias is already taken', async () => {
      const body = {
        original_url: 'https://www.example.com',
        custom_alias: 'taken-alias',
      };
      await request(app)
        .post('/url/custom')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(200);

      const response = await request(app)
        .post('/url/custom')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(400);

      expect(response.body.message).toBe('Custom alias already taken');
    });
  });
});
