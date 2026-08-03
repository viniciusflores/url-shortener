import { Router } from 'express';
import {
  createUrlShortener,
  getUrlShortenerByHash,
  createCustomUrlShortener,
} from './controllers/urlShortenerController';
import { registerUser, performLogin } from './controllers/userAuthController';
import { authMiddleware } from './middlewares/authMiddleware';

const routes = Router();

// Authentication Routes
routes.post('/auth/register/', registerUser);
routes.post('/auth/login/', performLogin);

// Public routes
routes.get('/url/:hash', getUrlShortenerByHash);
routes.post('/url/', createUrlShortener);

// Auth Required Routes
routes.post('/url/custom', authMiddleware, createCustomUrlShortener);

export default routes;
