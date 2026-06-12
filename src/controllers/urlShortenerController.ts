import { Request, Response } from 'express';
import { getByHash, getByUrl, createUrl } from '../models/urlShortenerModel';
import { generateHash } from '../utils/generateHash';
import { isValidURL } from '../utils/urlValidator';
const { BASE_URL } = process.env;

const getUrlShortenerByHash = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { hash } = req.params;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).send('Bad Request');
  }

  const data = await getByHash(hash);

  if (data === null) {
    return res.status(404).send('Not Found');
  }

  return res.redirect(data.original_url);
};

const createUrlShortener = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { original_url } = req.body;

  if (!original_url) {
    return res
      .status(400)
      .send('Bad Request: Absence of original_url parameter');
  }

  if (!isValidURL(original_url)) {
    return res
      .status(400)
      .send('Bad Request: Invalid URL, follow the patter "http://url.com"');
  }

  const data = await getByUrl(original_url);

  if (data) {
    return res.json({
      shortened_url: `${BASE_URL}/url/${data.hashed_url}`,
    });
  } else {
    let availableHash;
    let hashed_url;

    do {
      hashed_url = generateHash();
      availableHash = await getByHash(hashed_url);
    } while (availableHash);

    await createUrl(original_url, hashed_url);
    const shortened_url = `${process.env.BASE_URL}/url/${hashed_url}`;
    return res.json({ shortened_url: shortened_url });
  }
};

export { createUrlShortener, getUrlShortenerByHash };
