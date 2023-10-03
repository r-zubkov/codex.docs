import { NextFunction, Request, Response } from 'express';
import appConfig from '../../utils/appConfig.js';

/**
 * Middleware for checking locals.isAuthorized property, which allows to edit/create pages
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export function allowEdit(req: Request, res: Response, next: NextFunction): void {
  if (res.locals.isAuthorized) {
    next();
  } else {
    res.redirect(`${appConfig.frontend.basePath}/auth`);
  }
}

/**
 * Middleware for checking frontend.isPrivate property, which allows to view pages for private project
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
 export function allowView(req: Request, res: Response, next: NextFunction): void {
  if (appConfig.frontend.isPrivate) {
    allowEdit(req, res, next);
  } else {
    next();
  }
}