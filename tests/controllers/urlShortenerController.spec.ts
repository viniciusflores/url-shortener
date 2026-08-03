import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';

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
  });
});
