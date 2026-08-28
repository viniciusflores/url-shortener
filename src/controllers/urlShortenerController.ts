import { NextFunction, Request, Response } from 'express';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';
import { UrlShortenerService } from '../services/urlShortenerService';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../lib/errors';
import { logger } from '../lib/logger/winston';
import { EventClickService } from '../services/eventClickService';
import { PrismaClickEventRepository } from '../repositories/prisma/prismaEventClickRepository';

const service = new UrlShortenerService(new PrismaUrlRepository());
const analyticsService = new EventClickService(
  new PrismaClickEventRepository(),
);

const getUrlShortenerByHash = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { hash } = req.params;
    if (!hash || typeof hash !== 'string') {
      throw new BadRequestError('Bad Request: Absence of hash parameter');
    }

    const shortener = await service.resolveShortenedUrl(hash);
    if (!shortener) {
      throw new NotFoundError('Not Found : The requested URL does not exist');
    }

    const ip = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    await analyticsService.insert(hash, ip, userAgent);

    return res.redirect(shortener.original_url);
  } catch (err: any) {
    logger.error('Error in getUrlShortenerByHash:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

const createUrlShortener = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { original_url } = req.body;
    if (!original_url) {
      throw new BadRequestError(
        'Bad Request: Absence of original_url parameter',
      );
    }

    const shortened_url = await service.shorten(original_url!);

    return res.json({ shortened_url });
  } catch (err: any) {
    logger.error('Error creating shortened URL:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

const createCustomUrlShortener = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized: Invalid user context');
    }

    const { original_url, custom_alias } = req.body;
    const { userId, email } = req.user;

    if (!userId || !email) {
      throw new UnauthorizedError('Unauthorized: Invalid user context');
    }

    if (!original_url) {
      throw new BadRequestError(
        'Bad Request: Absence of original_url parameter',
      );
    }

    if (!custom_alias) {
      throw new BadRequestError(
        'Bad Request: Absence of custom_alias parameter',
      );
    }

    const shortened_url = await service.shorten(
      original_url,
      custom_alias,
      userId,
    );
    return res.json({ shortened_url });
  } catch (err: any) {
    logger.error('Error creating custom shortened URL:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

export { createUrlShortener, getUrlShortenerByHash, createCustomUrlShortener };
