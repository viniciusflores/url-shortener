import { Request, Response } from 'express';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';
import { UrlShortenerService } from '../services/urlShortenerService';
import { logger } from '../lib/logger/winston';

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
    logger.error('Error in getUrlShortenerByHash:', {
      error: err,
      hash,
      errorMessage: err.message,
    });
    return res.status(404).send('Not Found');
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
    logger.error('Error creating shortened URL:', { error: err, original_url });
    return res.status(500).send('Internal Server Error');
  }
};

const createCustomUrlShortener = async (
  req: Request,
  res: Response,
): Promise<any> => {
  if (!req.user) {
    return res.status(401).send('Unauthorized: Invalid user context');
  }

  const { original_url, custom_alias } = req.body;
  const { userId, email } = req.user;

  if (!original_url) {
    return res
      .status(400)
      .send('Bad Request: Absence of original_url parameter');
  }

  if (!custom_alias) {
    return res
      .status(400)
      .send('Bad Request: Absence of custom_alias parameter');
  }

  if (!userId || !email) {
    return res.status(401).send('Unauthorized: Invalid user context');
  }

  try {
    const shortened_url = await service.shorten(
      original_url,
      BASE_URL!,
      custom_alias,
      userId,
    );
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
    logger.error('Error creating custom shortened URL:', {
      error: err,
      original_url,
      custom_alias,
    });
    return res.status(500).send('Internal Server Error');
  }
};

export { createUrlShortener, getUrlShortenerByHash, createCustomUrlShortener };
