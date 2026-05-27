import { NextFunction, Request, Response } from 'express';

const THEME_COOKIE_NAME = 'docs_theme_mode';
const MODE_DARK = 'dark';
const MODE_LIGHT = 'light';

const THEME_COLORS = {
  [MODE_LIGHT]: '#ffffff',
  [MODE_DARK]: '#0f141e',
};

type ThemeMode = typeof MODE_DARK | typeof MODE_LIGHT;

/**
 * Adds initial theme data for SSR when user picked an explicit color mode.
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export default function setThemeLocals(req: Request, res: Response, next: NextFunction): void {
  const mode = req.cookies?.[THEME_COOKIE_NAME];

  if (mode === MODE_DARK || mode === MODE_LIGHT) {
    res.locals.theme = {
      mode,
      name: mode,
      color: THEME_COLORS[mode as ThemeMode],
    };
  }

  next();
}
