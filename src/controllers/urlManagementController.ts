import { Request, Response } from 'express';
import { PrismaUrlRepository } from '../repositories/prisma/prismaUrlRepository';
import { PrismaUserRepository } from '../repositories/prisma/prismaUserRepository';
import { PrismaClickEventRepository } from '../repositories/prisma/prismaEventClickRepository';
import { UrlManagementService } from '../services/urlManagementService';
import { BadRequestError, UnauthorizedError } from '../lib/errors';

const service = new UrlManagementService(
  new PrismaUrlRepository(),
  new PrismaUserRepository(),
  new PrismaClickEventRepository(),
);

const getMyUrls = async (req: Request, res: Response): Promise<any> => {
  if (!req.user) {
    throw new UnauthorizedError('Unauthorized: Invalid user context');
  }
  const { userId, email } = req.user;
  if (!userId || !email) {
    throw new UnauthorizedError('Unauthorized: User not authenticated');
  }

  const urls = await service.showMyUrls(userId);
  return res.json(urls);
};

const getMyUrlByHash = async (req: Request, res: Response): Promise<any> => {
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
};

const updateAlias = async (req: Request, res: Response): Promise<any> => {
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
};

const deleteUrl = async (req: Request, res: Response): Promise<any> => {
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
};

export { getMyUrls, getMyUrlByHash, updateAlias, deleteUrl };
