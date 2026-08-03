import { Request, Response } from 'express';
import { UserAuthService } from '../services/userAuthService';
import { PrismaUserRepository } from '../repositories/prisma/prismaUserRepository';

const service = new UserAuthService(new PrismaUserRepository());

const registerUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Bad Request');
  }

  try {
    const name = await service.register(username, password);

    if (name != null) {
      return res.status(200).send(`Success auth register to: ${name}`);
    } else {
      return res.status(500).send('Internal Server Error');
    }
  } catch (error: any) {
    // Handle duplicate user error
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).send('User already exists');
    }
    // Re-throw other errors for global error handler
    return res.status(500).send('Internal Server Error');
  }
};

const performLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Bad Request');
  }

  try {
    const token = await service.retrieve(username, password);
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error });
  }
};

export { registerUser, performLogin };
