import express, { Request, Response } from 'express';
import appConfig from '../utils/appConfig.js';
import verifyToken from './middlewares/token.js';
import PagesOrder from '../controllers/pagesOrder.js';
import Pages from '../controllers/pages.js';


const router = express.Router();

/* GET home page. */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  const config = req.app.locals.config;

  // Check if config consists startPage
  if (config.startPage) {
    return res.redirect(`${appConfig.frontend.basePath}/${config.startPage}`);
  } else {
    const pageOrder = await PagesOrder.getRootPageOrder();

    // Check if page order consists
    if (pageOrder.order.length > 0) {
      // Get the first parent page
      const page = await Pages.get(pageOrder.order[0]);

      res.redirect(`${appConfig.frontend.basePath}/${page.uri!}`);
    } else {
      res.render('pages/index', { isAuthorized: res.locals.isAuthorized });
    }
  }
});

export default router;
