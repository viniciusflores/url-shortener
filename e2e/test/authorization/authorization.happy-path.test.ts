import got from 'got';
import { expect, describe, test } from 'vitest';

const { BASE_URL } = process.env;

describe('Authorization happy path test', function () {
  test('should be possible to register an user', async function () {
    const timestamp = Date.now();
    const username = `user_register${timestamp}@example.com`;
    const password = `password${timestamp}`;

    const response = await got.post(`${BASE_URL}/auth/register`, {
      json: {
        username,
        password,
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.body).to.equal(`Success auth register to: ${username}`);
  });

  test('should be possible to login an user', async function () {
    const timestamp = Date.now();
    const username = `user_login${timestamp}@example.com`;
    const password = `password${timestamp}`;

    await got.post(`${BASE_URL}/auth/register`, {
      json: {
        username,
        password,
      },
    });

    const response = await got.post(`${BASE_URL}/auth/login`, {
      json: {
        username,
        password,
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response.body)).toHaveProperty('token');
    expect(JSON.parse(response.body).token).toBeTypeOf('string');
  });
});
