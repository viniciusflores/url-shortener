import got from 'got';
import { expect, describe, test } from 'vitest';

const { BASE_URL } = process.env;

describe('Authorization validation tests', function () {
  test('should be possible to register an user twice', async function () {
    const timestamp = Date.now();
    const username = `user${timestamp}@example.com`;
    const password = `password${timestamp}`;

    await got.post(`${BASE_URL}/auth/register`, {
      json: {
        username,
        password,
      },
    });

    try {
      await got.post(`${BASE_URL}/auth/register`, {
        json: {
          username,
          password,
        },
      });
      expect.fail('Expected HTTPError to be thrown');
    } catch (error: any) {
      expect(error.response.statusCode).to.equal(409);
      expect(error.response.body).to.equal('User already exists');
    }
  });
});
