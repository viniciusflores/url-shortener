import { assert } from 'chai';
import got from 'got';

const { BASE_URL } = process.env;
describe('Verify edge cases', function () {
  it('not be possible to create a shortener URL without parameter default', async function () {
    try {
      await got.post(`${BASE_URL}/url`, {
        json: {
          wrong_parameter: 'original_url',
        },
      });
    } catch (error) {
      assert.equal(error.response.statusCode, 400);
      assert.equal(
        error.response.body,
        'Bad Request: Absence of original_url parameter',
      );
    }
  });

  it('not be possible to create a shortener URL with a non valid URL', async function () {
    try {
      await got.post(`${BASE_URL}/url`, {
        json: {
          original_url: 'google',
        },
      });
    } catch (error) {
      assert.equal(error.response.statusCode, 400);
      assert.equal(
        error.response.body,
        'Bad Request: Invalid URL, follow the patter "http://url.com"',
      );
    }
  });
});
