import { NextFunction, Request, Response } from 'express';
import { UserAuthService } from '../services/userAuthService';
import { PrismaUserRepository } from '../repositories/prisma/prismaUserRepository';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../lib/errors';
import { logger } from '../lib/logger/winston';

const service = new UserAuthService(new PrismaUserRepository());

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError('Bad Request: Missing required fields');
    }

    const name = await service.register(username, password);

    if (name != null) {
      return res.status(200).send(`Success auth register to: ${name}`);
    } else {
      throw new ConflictError('Conflict: User registration failed');
    }
  } catch (err: any) {
    logger.error('Error in registerUser:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

const performLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError('Bad Request: Missing required fields');
    }

    const token = await service.retrieve(username, password);
    if (token != null) {
      return res.status(200).json({ token });
    } else {
      throw new UnauthorizedError('Unauthorized: Invalid credentials');
    }
  } catch (err: any) {
    logger.error('Error in performLogin:', {
      error: err,
      errorMessage: err.message,
    });
    next(err);
  }
};

export { registerUser, performLogin };
