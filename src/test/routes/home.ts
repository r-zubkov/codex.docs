import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import chai, { expect } from 'chai';
import chaiHTTP from 'chai-http';
import home from '../../backend/routes/home.js';
import Aliases from '../../backend/controllers/aliases.js';
import Pages from '../../backend/controllers/pages.js';
import PagesOrder from '../../backend/controllers/pagesOrder.js';
import Alias from '../../backend/models/alias.js';
import Page from '../../backend/models/page.js';
import PageOrder from '../../backend/models/pageOrder.js';
import PagesFlatArray from '../../backend/models/pagesFlatArray.js';
import appConfig from '../../backend/utils/appConfig.js';
import { EntityId } from '../../backend/database/types.js';

chai.use(chaiHTTP);

const id = (value: string): EntityId => value as EntityId;

describe('Home route', () => {
  const originalGetAlias = Aliases.get;
  const originalGetPage = Pages.get;
  const originalGetNavigationPages = Pages.getNavigationPages;
  const originalGetAllOrders = PagesOrder.getAll;
  const originalGetPageBefore = PagesFlatArray.getPageBefore;
  const originalGetPageAfter = PagesFlatArray.getPageAfter;
  const originalIsPrivate = appConfig.frontend.isPrivate;

  afterEach(() => {
    Aliases.get = originalGetAlias;
    Pages.get = originalGetPage;
    Pages.getNavigationPages = originalGetNavigationPages;
    PagesOrder.getAll = originalGetAllOrders;
    PagesFlatArray.getPageBefore = originalGetPageBefore;
    PagesFlatArray.getPageAfter = originalGetPageAfter;
    appConfig.frontend.isPrivate = originalIsPrivate;
  });

  function createApp(frontendConfig: typeof appConfig.frontend): express.Express {
    const app = express();

    app.locals.config = frontendConfig;
    app.use(cookieParser());
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.render = ((view: string, locals?: Record<string, unknown>) => {
        res.status(200).json({
          view,
          locals,
          menu: res.locals.menu,
          menuLoaded: res.locals.menuLoaded,
        });
      }) as Response['render'];
      next();
    });
    app.use('/', home);

    return app;
  }

  function stubStartPage(): void {
    Aliases.get = async () => new Alias({
      id: id('page-1'),
      type: Alias.types.PAGE,
    }, 'start-page');
    Pages.get = async () => ({
      _id: id('page-1'),
      title: 'Start page',
      uri: 'start-page',
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Start page',
            },
          },
        ],
      },
      getParent: async () => new Page(),
    }) as Page;
    PagesFlatArray.getPageBefore = async () => undefined;
    PagesFlatArray.getPageAfter = async () => undefined;
  }

  it('Loads menu before rendering configured start page', async () => {
    let menuRequested = false;

    stubStartPage();
    Pages.getNavigationPages = async () => {
      menuRequested = true;

      return [
        {
          _id: id('page-1'),
          title: 'Start page',
          uri: 'start-page',
          parent: id('0'),
        },
      ];
    };
    PagesOrder.getAll = async () => [
      new PageOrder({
        page: id('0'),
        order: [id('page-1')],
      }),
    ];

    const app = createApp({
      ...appConfig.frontend,
      startPage: 'start-page',
    });
    const res = await chai.request(app).get('/');

    expect(res).to.have.status(200);
    expect(res.body.view).to.equal('pages/page');
    expect(menuRequested).to.be.true;
    expect(res.body.menuLoaded).to.be.true;
    expect(res.body.menu).to.have.length(1);
    expect(res.body.menu[0].title).to.equal('Start page');
  });

  it('Redirects private root page before rendering docs content', async () => {
    let menuRequested = false;

    appConfig.frontend.isPrivate = true;
    stubStartPage();
    Pages.getNavigationPages = async () => {
      menuRequested = true;

      return [];
    };
    PagesOrder.getAll = async () => [];

    const app = createApp({
      ...appConfig.frontend,
      startPage: 'start-page',
    });
    const res = await chai.request(app).get('/').redirects(0);

    expect(res).to.have.status(302);
    expect(res.header.location).to.equal(`${appConfig.frontend.basePath}/auth`);
    expect(menuRequested).to.be.false;
  });
});
