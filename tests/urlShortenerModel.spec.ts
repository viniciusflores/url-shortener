import { vi, describe, test, expect, beforeEach } from 'vitest';

const { mockCreate, mockFindFirst } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindFirst: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: function PrismaPg() {},
}));

vi.mock('../prisma/generated/client', () => ({
  PrismaClient: function PrismaClient() {
    return {
      urlShortener: {
        create: mockCreate,
        findFirst: mockFindFirst,
      },
    };
  },
}));

import {
  createUrl,
  getByHash,
  getByUrl,
} from '../src/models/urlShortenerModel';

const fakeRecord = {
  id: 1,
  original_url: 'https://google.com',
  hashed_url: 'abc123',
};

describe('urlShortenerModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUrl', () => {
    test('calls prisma.create with original_url and hashed_url', async () => {
      mockCreate.mockResolvedValue(fakeRecord);

      const result = await createUrl('https://google.com', 'abc123');

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: { original_url: 'https://google.com', hashed_url: 'abc123' },
      });
      expect(result).toEqual(fakeRecord);
    });
  });

  describe('getByUrl', () => {
    test('returns the record when original_url is found', async () => {
      mockFindFirst.mockResolvedValue(fakeRecord);

      const result = await getByUrl('https://google.com');

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { original_url: 'https://google.com' },
      });
      expect(result).toEqual(fakeRecord);
    });

    test('returns null when original_url is not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getByUrl('https://notfound.com');

      expect(result).toBeNull();
    });
  });

  describe('getByHash', () => {
    test('returns the record when hash is found', async () => {
      mockFindFirst.mockResolvedValue(fakeRecord);

      const result = await getByHash('abc123');

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { hashed_url: 'abc123' },
      });
      expect(result).toEqual(fakeRecord);
    });

    test('returns null when hash is not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getByHash('notexist');

      expect(result).toBeNull();
    });
  });
});
