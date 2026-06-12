import { expect, assert } from 'chai';
import got from 'got';

const { BASE_URL } = process.env;

describe('Verify business rules', function () {
  it('will always be shortened to the same unique short URL', async function () {
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

  it('should not be possible to get an inexistent URL', async function () {
    try {
      const parameter = 'non-existent-url';
      await got.get(`${BASE_URL}/url/${parameter}`);
    } catch (error: any) {
      assert.equal(error.response.statusCode, 404);
      assert.equal(error.response.body, 'Not Found');
    }
  });
});
