import { Router } from 'express';
import {
  createUrlShortener,
  getUrlShortenerByHash,
  createCustomUrlShortener,
} from './controllers/urlShortenerController';
import { registerUser, performLogin } from './controllers/userAuthController';
import {
  getMyUrls,
  getMyUrlByHash,
  updateAlias,
  deleteUrl,
} from './controllers/urlManagementController';
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

routes.get('/me/urls', authMiddleware, getMyUrls);
routes.get('/me/urls/:hash', authMiddleware, getMyUrlByHash);
routes.patch('/me/urls/:hash', authMiddleware, updateAlias);
routes.delete('/me/urls/:hash', authMiddleware, deleteUrl);

export default routes;
