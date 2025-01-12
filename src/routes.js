import { Router } from 'express';
import { createUrlShortener, getUrlShortenerByHash } from './controllers/urlShortenerController.js';

const routes = Router();

routes.get('/url/:hash', getUrlShortenerByHash)

routes.post('/url/', createUrlShortener)

export default routes
