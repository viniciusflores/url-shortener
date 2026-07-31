import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

describe('URL Shortener Controller', () => {
  beforeEach(async () => {
    await prisma.urlShortener.deleteMany({});
  });

  describe('GET /url/:hash', () => {
    it('should redirect to original URL when hash exists', async () => {
      const originalUrl = 'https://www.example.com';
      const hash = 'abc123';

      await prisma.urlShortener.create({
        data: {
          original_url: originalUrl,
          hashed_url: hash,
        },
      });

      const response = await request(app).get(`/url/${hash}`).expect(302);

      expect(response.headers.location).toBe(originalUrl);
    });

    it('should return 404 when hash does not exist', async () => {
      const response = await request(app).get('/url/nonexistent').expect(404);

      expect(response.text).toBe('Not Found');
    });
  });

  describe('POST /url/', () => {
    it('should create a shortened URL for valid input', async () => {
      const originalUrl = 'https://www.example.com';

      const response = await request(app)
        .post('/url/')
        .send({ original_url: originalUrl })
        .expect(200);

      expect(response.body).toHaveProperty('shortened_url');
    });

    it('should return 400 for missing original_url', async () => {
      const response = await request(app).post('/url/').send({}).expect(400);

      expect(response.text).toContain('Bad Request');
    });

    it('should return 400 for invalid URL format', async () => {
      const response = await request(app)
        .post('/url/')
        .send({ original_url: 'invalid-url' })
        .expect(400);

      expect(response.text).toContain('Bad Request');
    });
  });

  describe('POST /url/custom', () => {
    it('should return 401 for unauthenticated access', async () => {
      const response = await request(app)
        .post('/url/custom')
        .send({})
        .expect(401);

      // Adjusted expectation to match actual auth middleware output
      expect(response.body).toHaveProperty('error');
    });
  });
});
