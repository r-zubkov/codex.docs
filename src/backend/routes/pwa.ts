import express, { Request, Response } from 'express';
import appConfig from '../utils/appConfig.js';
import { buildManifest, buildServiceWorker } from '../utils/pwa.js';
import { FaviconData } from '../utils/downloadFavicon.js';

const router = express.Router();

/**
 * PWA manifest endpoint
 */
router.get('/manifest.webmanifest', (req: Request, res: Response) => {
  const favicon = req.app.locals.favicon as FaviconData | undefined;
  const manifest = buildManifest(appConfig.frontend, favicon);

  res
    .type('application/manifest+json')
    .set('Cache-Control', 'public, max-age=300')
    .send(JSON.stringify(manifest, null, 2));
});

/**
 * PWA service worker endpoint
 */
router.get('/sw.js', (req: Request, res: Response) => {
  const favicon = req.app.locals.favicon as FaviconData | undefined;
  const serviceWorker = buildServiceWorker(appConfig.frontend, favicon);

  res
    .type('application/javascript')
    .set('Cache-Control', 'no-cache')
    .send(serviceWorker);
});

export default router;
