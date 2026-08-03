import got from 'got';
import { expect, describe, test } from 'vitest';

const { BASE_URL } = process.env;

describe('Shorten URL happy path tests', function () {
  test('should create a new shortener url', async function () {
    const timestamp = Date.now();
    const original_url = `https://google.com${timestamp}`;

    const response = await got.post(`${BASE_URL}/url`, {
      json: {
        original_url,
      },
    });

    const { statusCode } = response;
    const body = JSON.parse(response.body) as { shortened_url: string };

    expect(statusCode).to.equal(200);
    expect(body).to.have.property('shortened_url');
    expect(body.shortened_url).that.is.a('string');
  });

  test('should be possible to create a new shortener url with a custom hash', async function () {
    const timestamp = Date.now();
    const username = `user${timestamp}@example.com`;
    const password = `password${timestamp}`;
    const original_url = `https://google.com${timestamp}`;
    const custom_alias = `custom-alias-${timestamp}`;

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

    const response = await got.post(`${BASE_URL}/url/custom`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: {
        original_url,
        custom_alias,
      },
    });

    const { statusCode } = response;
    const body = JSON.parse(response.body) as { shortened_url: string };

    expect(statusCode).to.equal(200);
    expect(body).to.have.property('shortened_url');
    expect(body.shortened_url).that.is.a('string');
  });
});
