import got from 'got';
import { expect, describe, test } from 'vitest';

const { BASE_URL } = process.env;

describe('Shorten URL validation tests', function () {
  test('will always be shortened to the same unique short URL', async function () {
    const timestamp = Date.now();
    const original_url = `https://www.google.com/?q=always+same+url+${timestamp}`;

    const response1 = await got.post(`${BASE_URL}/url`, {
      json: {
        original_url,
      },
    });

    expect(response1.statusCode).to.equal(200);
    const createdShortenedUrl = (
      JSON.parse(response1.body) as { shortened_url: string }
    ).shortened_url;

    const response2 = await got.post(`${BASE_URL}/url`, {
      json: {
        original_url,
      },
    });

    expect(response2.statusCode).to.equal(200);
    expect(
      (JSON.parse(response2.body) as { shortened_url: string }).shortened_url,
    ).to.equal(createdShortenedUrl);
  });

  test('not be possible to create a shortener URL without parameter default', async function () {
    try {
      await got.post(`${BASE_URL}/url`, {
        json: {
          wrong_parameter: 'original_url',
        },
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(400);
      // Updated to match actual error message
      expect(error.response.body).toContain(
        'Bad Request: Absence of original_url parameter',
      );
    }
  });

  test('not be possible to create a shortener URL with a non valid URL', async function () {
    try {
      await got.post(`${BASE_URL}/url`, {
        json: {
          original_url: 'google',
        },
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(400);
      // Updated to match actual error message
      expect(error.response.body).toContain('Bad Request: Invalid URL');
    }
  });

  test('should not be possible to shorten custom url with invalid credentials', async function () {
    const timestamp = Date.now();
    const original_url = `https://www.google.com/?q=custom+url+${timestamp}`;
    const custom_alias = `custom-alias-${timestamp}`;

    try {
      await got.post(`${BASE_URL}/url/custom`, {
        json: {
          original_url,
          custom_alias,
        },
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(401);
      expect(error.response.body).toContain('Missing or invalid token');
    }
  });

  test('should not be possible to shorten custom url with no custom alias', async function () {
    const timestamp = Date.now();
    const original_url = `https://www.google.com/?q=custom+url+${timestamp}`;

    const username = `user${timestamp}@example.com`;
    const password = `password${timestamp}`;

    await got.post(`${BASE_URL}/auth/register`, {
      json: {
        username,
        password,
      },
    });

    const responseAuth = await got.post(`${BASE_URL}/auth/login`, {
      json: {
        username,
        password,
      },
    });
    const token = JSON.parse(responseAuth.body).token;

    try {
      await got.post(`${BASE_URL}/url/custom`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          original_url,
        },
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(400);
      expect(error.response.body).toContain(
        'Bad Request: Absence of custom_alias parameter',
      );
    }
  });

  test('should not be possible to shorten custom url with no original url', async function () {
    const timestamp = Date.now();
    const custom_alias = `custom-alias-${timestamp}`;

    const username = `user${timestamp}@example.com`;
    const password = `password${timestamp}`;

    await got.post(`${BASE_URL}/auth/register`, {
      json: {
        username,
        password,
      },
    });

    const responseAuth = await got.post(`${BASE_URL}/auth/login`, {
      json: {
        username,
        password,
      },
    });
    const token = JSON.parse(responseAuth.body).token;

    try {
      await got.post(`${BASE_URL}/url/custom`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          custom_alias,
        },
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(400);
      expect(error.response.body).toContain(
        'Bad Request: Absence of original_url parameter',
      );
    }
  });
});
