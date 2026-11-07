import { Request, Response } from 'express';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';
import { UrlShortenerService } from '../services/urlShortenerService';
import { BadRequestError, UnauthorizedError } from '../lib/errors';
import { logger } from '../lib/logger/winston';
import { EventClickService } from '../services/eventClickService';
import { PrismaClickEventRepository } from '../repositories/prisma/prismaEventClickRepository';

const urlRepository = new PrismaUrlRepository();
const service = new UrlShortenerService(urlRepository);
const analyticsService = new EventClickService(
  new PrismaClickEventRepository(),
  urlRepository,
);

const getUrlShortenerByHash = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { hash } = req.params;
  if (!hash || typeof hash !== 'string') {
    throw new BadRequestError('Bad Request: Absence of hash parameter');
  }

  const shortener = await service.resolveShortenedUrl(hash);

  const ip = req.ip || '';
  const userAgent = req.headers['user-agent'] || '';

  analyticsService.insert(hash, ip, userAgent).catch((err) => {
    logger.error('Error registering click event:', {
      error: err,
      errorMessage: err.message,
      hash,
    });
  });

  return res.redirect(shortener.original_url);
};

const createUrlShortener = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { original_url } = req.body;
  if (!original_url) {
    throw new BadRequestError('Bad Request: Absence of original_url parameter');
  }

  const shortened_url = await service.shorten(original_url);

  return res.json({ shortened_url });
};

const createCustomUrlShortener = async (
  req: Request,
  res: Response,
): Promise<any> => {
  if (!req.user) {
    throw new UnauthorizedError('Unauthorized: Invalid user context');
  }

  const { original_url, custom_alias } = req.body;
  const { userId, email } = req.user;

  if (!userId || !email) {
    throw new UnauthorizedError('Unauthorized: Invalid user context');
  }

  if (!original_url) {
    throw new BadRequestError('Bad Request: Absence of original_url parameter');
  }

  if (!custom_alias) {
    throw new BadRequestError('Bad Request: Absence of custom_alias parameter');
  }

  const shortened_url = await service.shorten(
    original_url,
    custom_alias,
    userId,
  );
  return res.json({ shortened_url });
};

export { createUrlShortener, getUrlShortenerByHash, createCustomUrlShortener };
