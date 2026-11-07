import { Request, Response } from 'express';
import { UserAuthService } from '../services/userAuthService';
import { PrismaUserRepository } from '../repositories/prisma/prismaUserRepository';
import { BadRequestError } from '../lib/errors';

const service = new UserAuthService(new PrismaUserRepository());

const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Bad Request: Missing required fields');
  }

  const registeredEmail = await service.register(email, password);
  return res.status(201).json({ email: registeredEmail });
};

const performLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Bad Request: Missing required fields');
  }

  const token = await service.retrieve(email, password);
  return res.status(200).json({ token });
};

export { registerUser, performLogin };
