import { Request, Response } from 'express';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';
import { UrlShortenerService } from '../service/urlShortenerService';

const { BASE_URL } = process.env;

const service = new UrlShortenerService(new PrismaUrlRepository());

const getUrlShortenerByHash = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { hash } = req.params;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).send('Bad Request');
  }

  try {
    const originalUrl = await service.resolveShortenedUrl(hash);
    if (!originalUrl) {
      return res.status(404).send('Not Found');
    }
    return res.redirect(originalUrl);
  } catch (err: any) {
    if (err.message === 'URL not found') {
      return res.status(404).send('Not Found');
    }
    throw err;
  }
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

  try {
    const shortened_url = await service.shorten(original_url, BASE_URL!);
    return res.json({ shortened_url });
  } catch (err: any) {
    if (err.message === 'Missing URL') {
      return res
        .status(400)
        .send('Bad Request: Absence of original_url parameter');
    }
    if (err.message === 'Invalid URL') {
      return res
        .status(400)
        .send('Bad Request: Invalid URL, follow the patter "http://url.com"');
    }
    throw err;
  }
};

export { createUrlShortener, getUrlShortenerByHash };
