import { NextFunction, Request, Response } from 'express';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';
import { PrismaUserRepository } from '../repositories/prisma/prismaUserRepository';
import { UrlManagementService } from '../services/urlManagementService';
import { BadRequestError, UnauthorizedError } from '../lib/errors';
import { logger } from '../lib/logger/winston';

const service = new UrlManagementService(
  new PrismaUrlRepository(),
  new PrismaUserRepository(),
);

const getMyUrls = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized: Invalid user context');
    }
    const { userId, email } = req.user;
    if (!userId || !email) {
      throw new UnauthorizedError('Unauthorized: User not authenticated');
    }

    const urls = await service.showMyUrls(userId);
    return res.json(urls);
  } catch (err: any) {
    logger.error('Error in getMyUrls:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

const getMyUrlByHash = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized: Invalid user context');
    }
    const { userId, email } = req.user;
    if (!userId || !email) {
      throw new UnauthorizedError('Unauthorized: User not authenticated');
    }
    const { hash } = req.params;
    if (!hash || typeof hash !== 'string') {
      throw new BadRequestError('Bad Request: Absence of hash parameter');
    }

    const url = await service.showMyUrlByHash(userId, hash);
    return res.json(url);
  } catch (err: any) {
    logger.error('Error in getMyUrlByHash:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

const updateAlias = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized: Invalid user context');
    }
    const { userId, email } = req.user;
    if (!userId || !email) {
      throw new UnauthorizedError('Unauthorized: User not authenticated');
    }
    const { hash } = req.params;
    const { new_alias } = req.body;
    if (!hash || typeof hash !== 'string') {
      throw new BadRequestError('Bad Request: Absence of hash parameter');
    }
    if (!new_alias || typeof new_alias !== 'string') {
      throw new BadRequestError('Bad Request: Absence of new_alias parameter');
    }

    const newUrl = await service.updateAlias(userId, hash, new_alias);
    return res.status(200).send(newUrl);
  } catch (err: any) {
    logger.error('Error in updateAlias:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

const deleteUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized: Invalid user context');
    }
    const { userId, email } = req.user;
    if (!userId || !email) {
      throw new UnauthorizedError('Unauthorized: User not authenticated');
    }
    const { hash } = req.params;
    if (!hash || typeof hash !== 'string') {
      throw new BadRequestError('Bad Request: Absence of hash parameter');
    }

    await service.deleteUrl(userId, hash);
    return res.status(204).send();
  } catch (err: any) {
    logger.error('Error in deleteUrl:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

export { getMyUrls, getMyUrlByHash, updateAlias, deleteUrl };
