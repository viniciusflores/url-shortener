import got from 'got';
import { expect, describe, test } from 'vitest';

const { BASE_URL } = process.env;

describe('Retrieve URL validation tests', function () {
  test('should not be possible to get an inexistent URL', async function () {
    try {
      const parameter = 'non-existent-url';
      await got.get(`${BASE_URL}/url/${parameter}`);
    } catch (error: any) {
      expect(error.response.statusCode).toBe(400);
      const errorMessage = JSON.parse(error.response.body).message;
      expect(errorMessage).toBe('Invalid hash format provided');
    }
  });

  test('should not be possible to get an URL without parameter', async function () {
    try {
      await got.get(`${BASE_URL}/url/`);
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
      expect(error.response.body).toMatch(/<title>Error<\/title>/);
      expect(error.response.body).toMatch(/Cannot GET \/url\//);
    }
  });
});
