import { vi, describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';

const { mockGetByHash, mockGetByUrl, mockCreateUrl } = vi.hoisted(() => {
  process.env.BASE_URL = 'http://localhost:3000';
  return {
    mockGetByHash: vi.fn(),
    mockGetByUrl: vi.fn(),
    mockCreateUrl: vi.fn(),
  };
});

vi.mock('../src/service/urlShortenerService', () => ({
  getByHash: mockGetByHash,
  getByUrl: mockGetByUrl,
  createUrl: mockCreateUrl,
}));

import app from '../src/app';

const fakeRecord = {
  id: 1,
  original_url: 'https://google.com',
  hashed_url: 'abc123',
};

describe('urlShortenerController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /url/:hash', () => {
    test('redirects to original_url when hash is found', async () => {
      mockGetByHash.mockResolvedValue(fakeRecord);

      const res = await request(app).get('/url/abc123');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://google.com');
    });

    test('returns 404 when hash is not found', async () => {
      mockGetByHash.mockResolvedValue(null);

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
      const res = await request(app)
        .post('/url/')
        .send({ original_url: 'not-a-url' });

      expect(res.status).toBe(400);
    });

    test('returns existing shortened_url when url was already registered', async () => {
      mockGetByUrl.mockResolvedValue(fakeRecord);

      const res = await request(app)
        .post('/url/')
        .send({ original_url: 'https://google.com' });

      expect(res.status).toBe(200);
      expect(res.body.shortened_url).toBe('http://localhost:3000/url/abc123');
      expect(mockCreateUrl).not.toHaveBeenCalled();
    });

    test('creates a new record and returns shortened_url for a new url', async () => {
      mockGetByUrl.mockResolvedValue(null);
      mockGetByHash.mockResolvedValue(null);
      mockCreateUrl.mockResolvedValue(fakeRecord);

      const res = await request(app)
        .post('/url/')
        .send({ original_url: 'https://google.com' });

      expect(res.status).toBe(200);
      expect(res.body.shortened_url).toMatch(/^http:\/\/localhost:3000\/url\//);
      expect(mockCreateUrl).toHaveBeenCalledOnce();
    });

    test('retries hash generation when the first generated hash is already taken', async () => {
      mockGetByUrl.mockResolvedValue(null);
      // first call: hash collision; second call: hash is free
      mockGetByHash
        .mockResolvedValueOnce(fakeRecord)
        .mockResolvedValueOnce(null);
      mockCreateUrl.mockResolvedValue(fakeRecord);

      const res = await request(app)
        .post('/url/')
        .send({ original_url: 'https://google.com' });

      expect(res.status).toBe(200);
      expect(mockGetByHash).toHaveBeenCalledTimes(2);
      expect(mockCreateUrl).toHaveBeenCalledOnce();
    });
  });
});
