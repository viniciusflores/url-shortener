import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { UrlShortenerService } from '../../src/services/urlShortenerService';

// Mock the service and repository
vi.mock('../../src/repositories/prisma/prismaUrlRepository');
vi.mock('../../src/services/urlShortenerService');

describe('URL Shortener Controller - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /url/', () => {
    it('should handle missing original_url parameter', async () => {
      const response = await request(app).post('/url/').send({}).expect(400);
      const errorMessage = JSON.parse(response.text).message;
      expect(errorMessage).toBe(
        'Bad Request: Absence of original_url parameter',
      );
    });

    it('should handle invalid URL format', async () => {
      // Mock the service to throw an error for invalid URLs
      vi.spyOn(UrlShortenerService.prototype, 'shorten').mockRejectedValue(
        new Error('Invalid URL'),
      );

      const response = await request(app)
        .post('/url/')
        .send({ original_url: 'invalid-url' })
        .expect(500);

      const errorMessage = JSON.parse(response.text).message;
      expect(errorMessage).toBe('Internal Server Error');
    });

    it('should handle service error during shorten operation', async () => {
      vi.spyOn(UrlShortenerService.prototype, 'shorten').mockRejectedValue(
        new Error('Database connection failed'),
      );

      const response = await request(app)
        .post('/url/')
        .send({ original_url: 'https://www.example.com' })
        .expect(500);
      const errorMessage = JSON.parse(response.text).message;
      expect(errorMessage).toBe('Internal Server Error');
    });
  });

  describe('GET /url/:hash', () => {
    it('should handle non-existent hash with proper error handling', async () => {
      // Mock the service to return null for non-existent hashes
      vi.spyOn(
        UrlShortenerService.prototype,
        'resolveShortenedUrl',
      ).mockResolvedValue(null);

      const response = await request(app).get('/url/nonexistent').expect(404);

      const errorMessage = JSON.parse(response.text).message;
      expect(errorMessage).toBe('Not Found : The requested URL does not exist');
    });
  });
});
