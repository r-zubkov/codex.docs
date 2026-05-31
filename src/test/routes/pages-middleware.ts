import { expect } from 'chai';
import { NextFunction, Request, Response } from 'express';
import Pages from '../../backend/controllers/pages.js';
import PagesOrder from '../../backend/controllers/pagesOrder.js';
import PageOrder from '../../backend/models/pageOrder.js';
import { EntityId } from '../../backend/database/types.js';
import pagesMiddleware from '../../backend/routes/middlewares/pages.js';

const id = (value: string): EntityId => value as EntityId;

describe('Pages middleware', () => {
  const originalGetNavigationPages = Pages.getNavigationPages;
  const originalGetAll = PagesOrder.getAll;

  afterEach(() => {
    Pages.getNavigationPages = originalGetNavigationPages;
    PagesOrder.getAll = originalGetAll;
  });

  function runMiddleware(req: Request, res: Response): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      pagesMiddleware(req, res, ((error?: unknown) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      }) as NextFunction);
    });
  }

  it('Builds menu when previous middleware initialized an empty menu array', async () => {
    Pages.getNavigationPages = async () => [
      {
        _id: id('page-1'),
        title: 'Page 1',
        uri: 'page-1',
        parent: id('0'),
      },
    ];
    PagesOrder.getAll = async () => [
      new PageOrder({
        page: id('0'),
        order: [id('page-1')],
      }),
    ];

    const req = { method: 'GET' } as Request;
    const res = { locals: { menu: [] } } as unknown as Response;

    await runMiddleware(req, res);

    expect(res.locals.menu).to.have.length(1);
    expect(res.locals.menu[0].title).to.equal('Page 1');
    expect(res.locals.menuLoaded).to.be.true;
  });

  it('Skips menu loading when menu was already loaded explicitly', async () => {
    let menuRequested = false;

    Pages.getNavigationPages = async () => {
      menuRequested = true;

      return [];
    };

    const req = { method: 'GET' } as Request;
    const res = {
      locals: {
        menu: [
          {
            _id: id('existing-page'),
            title: 'Existing page',
            uri: 'existing-page',
            children: [],
          },
        ],
        menuLoaded: true,
      },
    } as unknown as Response;

    await runMiddleware(req, res);

    expect(menuRequested).to.be.false;
    expect(res.locals.menu).to.have.length(1);
    expect(res.locals.menu[0].title).to.equal('Existing page');
  });
});
