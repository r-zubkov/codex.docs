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

/**
 * Import modules
 */
import Writing from './modules/writing';
import Page from './modules/page';
import Sidebar from './modules/sidebar';

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

    document.addEventListener('DOMContentLoaded', (event) => {
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
}

export default new Docs();
