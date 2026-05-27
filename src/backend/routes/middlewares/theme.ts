import { NextFunction, Request, Response } from 'express';

const THEME_COOKIE_NAME = 'docs_theme_mode';
const MODE_SYSTEM = 'system';
const MODE_DARK = 'dark';
const MODE_LIGHT = 'light';

const THEME_COLORS = {
  [MODE_LIGHT]: '#ffffff',
  [MODE_DARK]: '#0f141e',
};

type ThemeName = typeof MODE_DARK | typeof MODE_LIGHT;
type ThemeMode = typeof MODE_SYSTEM | ThemeName;

/**
 * Adds initial theme data for SSR before client preferences are available.
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export default function setThemeLocals(req: Request, res: Response, next: NextFunction): void {
  const savedMode = req.cookies?.[THEME_COOKIE_NAME];
  const mode: ThemeMode = savedMode === MODE_SYSTEM || savedMode === MODE_DARK || savedMode === MODE_LIGHT
    ? savedMode
    : MODE_SYSTEM;
  const name: ThemeName = mode === MODE_LIGHT ? MODE_LIGHT : MODE_DARK;

  res.locals.theme = {
    mode,
    name,
    color: THEME_COLORS[name],
  };

  next();
}
