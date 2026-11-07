import got from 'got';
import { expect, describe, test, beforeAll } from 'vitest';

const { BASE_URL } = process.env;

describe('URL Management tests', async () => {
  let timestamp: number;
  let username: string;
  let password: string;
  let original_url: string;
  let custom_alias: string;
  let token: string;

  beforeAll(async () => {
    timestamp = Date.now();
    username = `user_url_management${timestamp}@example.com`;
    password = `password${timestamp}`;
    original_url = `https://google.com${timestamp}`;
    custom_alias = `custom-alias-${timestamp}`;

    await got.post(`${BASE_URL}/auth/register`, {
      json: {
        email: username,
        password,
      },
    });

    const responseAuth = await got.post(`${BASE_URL}/auth/login`, {
      json: {
        email: username,
        password,
      },
    });

    token = JSON.parse(responseAuth.body).token;

    await got.post(`${BASE_URL}/url/custom`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: {
        original_url,
        custom_alias,
      },
    });
  });

  test('should be possible to get my urls', async () => {
    const response = await got.get(`${BASE_URL}/me/urls`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { statusCode } = response;
    const body = JSON.parse(response.body) as { shortened_url: string };
    expect(statusCode).to.equal(200);
    expect(body).toBeInstanceOf(Array);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          original_url: expect.any(String),
          hashed_url: expect.any(String),
          userId: expect.any(String),
        }),
      ]),
    );
  });

  test('should be possible to get my url by hash', async () => {
    const response = await got.get(`${BASE_URL}/me/urls/${custom_alias}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { statusCode } = response;
    const body = JSON.parse(response.body) as { shortened_url: string };
    expect(statusCode).to.equal(200);
    expect(body).toEqual(
      expect.objectContaining({
        original_url: original_url,
        hashed_url: custom_alias,
        userId: expect.any(String),
      }),
    );
  });
});
