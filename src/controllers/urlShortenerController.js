import { getByHash, getByUrl, createUrl } from '../models/urlShortenerModel.js';
import { generateHash } from '../utils/generateHash.js';
import { isValidURL } from '../utils/urlValidator.js';
const { BASE_URL } = process.env;

const getUrlShortenerByHash = async (req, res) => {
  const { hash } = req.params;

  if (!hash) {
    return res.status(400).send('Bad Request');
  }

  const data = await getByHash(hash);

  if (data === null) {
    return res.status(404).send('Not Found');
  }

  res.redirect(data.original_url);
};

const createUrlShortener = async (req, res) => {
  const { original_url } = req.body;

  if (!original_url) {
    return res.status(400).send('Bad Request');
  }

  if (!isValidURL(original_url)) {
    return res.status(400).send('Invalid URL');
  }

  const data = await getByUrl(original_url);

  if (data) {
    return res.json({
      shotened_url: `${BASE_URL}/${data.hashed_url}`,
    });
  } else {
    let availableHash;
    let hashed_url;

    do {
      hashed_url = generateHash();
      availableHash = await getByHash(hashed_url);
    } while (availableHash);

    createUrl(original_url, hashed_url);
    const shortened_url = `${process.env.BASE_URL}/${hashed_url}`;
    return res.json({ shotened_url: shortened_url });
  }
};

export { createUrlShortener, getUrlShortenerByHash };
