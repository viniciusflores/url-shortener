import { vi, describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';

const { mockShorten, mockResolveShortenedUrl } = vi.hoisted(() => {
  process.env.BASE_URL = 'http://localhost:3000';
  return {
    mockShorten: vi.fn(),
    mockResolveShortenedUrl: vi.fn(),
  };
});

vi.mock('../src/repositories/prisma/prismaUrlRepository', () => ({
  PrismaUrlRepository: vi.fn(),
}));

vi.mock('../src/service/urlShortenerService', () => ({
  UrlShortenerService: function UrlShortenerService() {
    return {
      shorten: mockShorten,
      resolveShortenedUrl: mockResolveShortenedUrl,
    };
  },
}));

import app from '../src/app';

describe('urlShortenerController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /url/:hash', () => {
    test('redirects to original_url when hash is found', async () => {
      mockResolveShortenedUrl.mockResolvedValue('https://google.com');

      const res = await request(app).get('/url/abc123');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://google.com');
    });

    test('returns 404 when hash is not found', async () => {
      mockResolveShortenedUrl.mockRejectedValue(new Error('URL not found'));

      const res = await request(app).get('/url/notexist');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /url', () => {
    test('returns 400 when original_url is missing', async () => {
      const res = await request(app).post('/url/').send({});

      expect(res.status).toBe(400);
    });

    test('returns 400 when original_url is not a valid URL', async () => {
      mockShorten.mockRejectedValue(new Error('Invalid URL'));

      const res = await request(app)
        .post('/url/')
        .send({ original_url: 'not-a-url' });

      expect(res.status).toBe(400);
    });

    test('returns shortened_url for a valid URL', async () => {
      mockShorten.mockResolvedValue('http://localhost:3000/url/abc123');

      const res = await request(app)
        .post('/url/')
        .send({ original_url: 'https://google.com' });

      expect(res.status).toBe(200);
      expect(res.body.shortened_url).toBe('http://localhost:3000/url/abc123');
    });
  });
});
