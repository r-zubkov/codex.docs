import express, { NextFunction, Request, Response } from 'express';
import verifyToken from './middlewares/token.js';
import PagesOrder from '../controllers/pagesOrder.js';
import Pages from '../controllers/pages.js';
import Aliases from '../controllers/aliases.js';
import Alias from '../models/alias.js';
import Page from '../models/page.js';
import PagesFlatArray from '../models/pagesFlatArray.js';


const router = express.Router();

/**
 * Render a docs page from the home route without issuing an intermediate redirect.
 *
 * @param req - request object
 * @param res - response object
 * @param page - page to render
 */
async function renderPage(req: Request, res: Response, page: Page): Promise<void> {
  if (!page._id) {
    throw new Error('Page id is not defined');
  }

  const pageParent = await page.getParent();
  const previousPage = await PagesFlatArray.getPageBefore(page._id);
  const nextPage = await PagesFlatArray.getPageAfter(page._id);

  res.render('pages/page', {
    page,
    pageParent,
    previousPage,
    nextPage,
    config: req.app.locals.config,
  });
}

/**
 * Resolve configured start page URI to a page model.
 *
 * @param uri - configured start page URI
 */
async function getStartPage(uri: string): Promise<Page> {
  const alias = await Aliases.get(uri);

  if (alias.type !== Alias.types.PAGE || !alias.id) {
    throw new Error('Start page alias not found');
  }

  return Pages.get(alias.id);
}

/* GET home page. */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const config = req.app.locals.config;

  try {
    // Check if config consists startPage.
    // Render it directly instead of redirecting, so the first response already contains theme bootstrap.
    if (config.startPage) {
      const page = await getStartPage(config.startPage);

      return renderPage(req, res, page);
    }

    const pageOrder = await PagesOrder.getRootPageOrder();

    // Check if page order consists.
    if (pageOrder.order.length > 0) {
      // Get the first parent page and render it without an intermediate redirect.
      const page = await Pages.get(pageOrder.order[0]);

      return renderPage(req, res, page);
    }

    res.render('pages/index', { isAuthorized: res.locals.isAuthorized });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

export default router;
