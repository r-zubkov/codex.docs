import express from 'express';
import home from './home.js';
import pages from './pages.js';
import auth from './auth.js';
import aliases from './aliases.js';
import api from './api/index.js';
import pagesMiddleware from './middlewares/pages.js';
import verifyToken from './middlewares/token.js';
import { allowEdit, allowView } from './middlewares/locals.js';

const router = express.Router();

router.use('/api', verifyToken, allowEdit, api);
router.use('/', auth);
router.use('/', home);
router.use('/page', verifyToken, allowView, pagesMiddleware, pages);
router.use('/', verifyToken, allowView, pagesMiddleware, aliases);

export default router;
