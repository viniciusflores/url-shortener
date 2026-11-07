import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../lib/errors';
import { EventClickService } from '../services/eventClickService';
import { PrismaClickEventRepository } from '../repositories/prisma/prismaEventClickRepository';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';

const service = new EventClickService(
  new PrismaClickEventRepository(),
  new PrismaUrlRepository(),
);

const getUrlAnalytics = async (req: Request, res: Response): Promise<any> => {
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

  const { from, to } = req.query;
  if (from !== undefined && typeof from !== 'string') {
    throw new BadRequestError('Bad Request: Invalid from parameter');
  }
  if (to !== undefined && typeof to !== 'string') {
    throw new BadRequestError('Bad Request: Invalid to parameter');
  }

  const analytics = await service.getAnalytics(userId, hash, from, to);
  return res.json(analytics);
};

export { getUrlAnalytics };
