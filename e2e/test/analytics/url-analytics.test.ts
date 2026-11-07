import got from 'got';
import { expect, describe, test, beforeAll } from 'vitest';

const { BASE_URL } = process.env;

const registerAndLogin = async (username: string, password: string) => {
  await got.post(`${BASE_URL}/auth/register`, {
    json: { email: username, password },
  });
  const response = await got.post(`${BASE_URL}/auth/login`, {
    json: { email: username, password },
  });
  return JSON.parse(response.body).token as string;
};

describe('URL analytics tests', () => {
  let ownerToken: string;
  let otherToken: string;
  let custom_alias: string;

  const getAnalytics = (token: string, query = '') =>
    got.get(`${BASE_URL}/me/urls/${custom_alias}/analytics${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      throwHttpErrors: false,
    });

  beforeAll(async () => {
    const timestamp = Date.now();
    custom_alias = `analytics-${timestamp}`;

    ownerToken = await registerAndLogin(
      `analytics_owner${timestamp}@example.com`,
      `password${timestamp}`,
    );
    otherToken = await registerAndLogin(
      `analytics_other${timestamp}@example.com`,
      `password${timestamp}`,
    );

    await got.post(`${BASE_URL}/url/custom`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
      json: { original_url: `https://google.com/${timestamp}`, custom_alias },
    });

    for (let i = 0; i < 2; i++) {
      await got.get(`${BASE_URL}/url/${custom_alias}`, {
        followRedirect: false,
      });
    }
  });

  test('owner should get click analytics grouped by day', async () => {
    const response = await getAnalytics(ownerToken);
    const body = JSON.parse(response.body);
    const today = new Date().toISOString().slice(0, 10);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      hash: custom_alias,
      totalClicks: 2,
      clicksByDay: [{ date: today, clicks: 2 }],
    });
  });

  test('owner should be able to filter analytics by date range', async () => {
    const response = await getAnalytics(
      ownerToken,
      '?from=2000-01-01&to=2000-01-31',
    );
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.totalClicks).toBe(0);
    expect(body.clicksByDay).toEqual([]);
  });

  test('should return 400 for an invalid date', async () => {
    const response = await getAnalytics(ownerToken, '?from=07-11-2026');

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toMatch(/YYYY-MM-DD/);
  });

  test('another user should not see analytics of a url they do not own', async () => {
    const response = await getAnalytics(otherToken);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).message).toBe('Url not found');
  });

  test('should return 401 without a token', async () => {
    const response = await got.get(
      `${BASE_URL}/me/urls/${custom_alias}/analytics`,
      { throwHttpErrors: false },
    );

    expect(response.statusCode).toBe(401);
  });
});
