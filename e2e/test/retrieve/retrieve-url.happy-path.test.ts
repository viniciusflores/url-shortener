import got from 'got';
import { expect, describe, test } from 'vitest';

const { BASE_URL } = process.env;

describe('Retrieve URL happy path tests', function () {
  test('should be possible to get shortener url created', async function () {
    const timestamp = Date.now();
    const original_url = `https://www.google.com/?q=${timestamp}`;

    const data = await got.post(`${BASE_URL}/url`, {
      json: {
        original_url,
      },
    });

    const urlWithShortenerPath = (
      JSON.parse(data.body) as { shortened_url: string }
    ).shortened_url;

    const response = await got.get(urlWithShortenerPath);
    const { statusCode, redirectUrls } = response;
    const body = JSON.parse(data.body) as { shortened_url: string };

    expect(statusCode).to.equal(200);
    expect(body).to.have.property('shortened_url');
    expect(body.shortened_url).that.is.a('string');
    expect(redirectUrls[0]).to.have.property('href').and.equal(original_url);
    expect(redirectUrls[0])
      .to.have.property('search')
      .and.equal(`?q=${timestamp}`);
  });
});
