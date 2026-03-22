// No inspection for unused var `css` because it's used for css bundle
// eslint-disable-next-line no-unused-vars
import '../styles/main.pcss';

/**
 * Module Dispatcher
 *
 * @see {@link https://github.com/codex-team/moduleDispatcher}
 * @author CodeX
 */
import ModuleDispatcher from 'module-dispatcher';
import FrontendConfig from '../../../frontend-config';

/**
 * Import modules
 */
import Writing from './modules/writing';
import Page from './modules/page';
import Sidebar from './modules/sidebar';
import Theme from './classes/theme';

/**
 * Main app class
 */
class Docs {
  /**
   * @class
   */
  constructor() {
    this.writing = new Writing();
    this.page = new Page();
    this.sidebar = new Sidebar();
    this.theme = new Theme();

    document.addEventListener('DOMContentLoaded', () => {
      this.theme.init();
      this.registerServiceWorker();
      this.docReady();
    });

    console.log('CodeX Docs initialized');
  }

  /**
   * Document is ready
   */
  docReady() {
    this.moduleDispatcher = new ModuleDispatcher({
      Library: this,
    });
  }

  /**
   * Registers service worker
   */
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const normalizedBasePath = FrontendConfig.basePath === '/'
      ? ''
      : FrontendConfig.basePath.replace(/\/$/, '');
    const serviceWorkerUrl = `${normalizedBasePath}/sw.js` || '/sw.js';
    const scope = `${normalizedBasePath || ''}/`;

    navigator.serviceWorker.register(serviceWorkerUrl, { scope })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  }
}

export default new Docs();
