import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import csrf from 'csurf';
import appConfig from '../utils/appConfig.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
const parseForm = express.urlencoded({ extended: false });

interface AuthViewData {
  csrfToken: string;
  header?: string;
}

/**
 * Render auth page without documentation menu.
 *
 * @param res - response object
 * @param data - auth view data
 */
function renderAuth(res: Response, data: AuthViewData): void {
  res.render('auth', {
    title: 'Login page',
    menu: [],
    ...data,
  });
}

/**
 * Authorization page
 */
router.get('/auth', csrfProtection, function (req: Request, res: Response) {
  renderAuth(res, {
    csrfToken: req.csrfToken(),
  });
});

/**
 * Process given password
 */
router.post('/auth', parseForm, csrfProtection, async (req: Request, res: Response) => {
  try {
    if (!appConfig.auth.password) {
      renderAuth(res, {
        header: 'Password not set',
        csrfToken: req.csrfToken(),
      });

      return;
    }

    if (req.body.password !== appConfig.auth.password) {
      renderAuth(res, {
        header: 'Wrong password',
        csrfToken: req.csrfToken(),
      });

      return;
    }

    const token = jwt.sign({
      iss: 'Codex Team',
      sub: 'auth',
      iat: Date.now(),
    }, appConfig.auth.password + appConfig.auth.secret);

    res.cookie(`${appConfig.frontend.appName}AuthToken`, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    res.redirect(appConfig.frontend.basePath);
  } catch (err) {
    renderAuth(res, {
      header: 'Password not set',
      csrfToken: req.csrfToken(),
    });

    return;
  }
});

export default router;
