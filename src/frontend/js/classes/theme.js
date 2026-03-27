import { Storage } from '../utils/storage';

const STORAGE_KEY = 'docs_theme_mode';
const MODE_SYSTEM = 'system';
const MODE_DARK = 'dark';
const MODE_LIGHT = 'light';
const MODE_ORDER = [MODE_SYSTEM, MODE_DARK, MODE_LIGHT];

const MODE_LABELS = {
  [MODE_SYSTEM]: 'Auto',
  [MODE_DARK]: 'Dark',
  [MODE_LIGHT]: 'Light',
};

const THEME_COLORS = {
  [MODE_LIGHT]: '#ffffff',
  [MODE_DARK]: '#0f141e',
};

/**
 * Handles docs color theme state
 */
export default class Theme {
  /**
   * Creates instance
   */
  constructor() {
    this.storage = new Storage(STORAGE_KEY);
    this.mode = MODE_SYSTEM;
    this.mediaQuery = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
    this.systemListenerBound = false;

    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  /**
   * Initializes theme behavior
   */
  init() {
    this.applyMode(this.getStoredMode(), { persist: false });
    this.bindToggleButtons();
  }

  /**
   * Returns normalized saved mode
   *
   * @returns {string}
   */
  getStoredMode() {
    try {
      const value = this.storage.get();

      if (MODE_ORDER.includes(value)) {
        return value;
      }
    } catch (e) {
      return MODE_SYSTEM;
    }

    return MODE_SYSTEM;
  }

  /**
   * Resolves theme from selected mode
   *
   * @param {string} mode
   * @returns {string}
   */
  resolveTheme(mode) {
    if (mode !== MODE_SYSTEM) {
      return mode;
    }

    return this.mediaQuery && this.mediaQuery.matches
      ? MODE_DARK
      : MODE_LIGHT;
  }

  /**
   * Applies selected mode
   *
   * @param {string} mode
   * @param {object} options
   * @param {boolean} options.persist
   */
  applyMode(mode, { persist = true } = {}) {
    this.mode = MODE_ORDER.includes(mode)
      ? mode
      : MODE_SYSTEM;

    const theme = this.resolveTheme(this.mode);
    const root = document.documentElement;

    root.setAttribute('data-theme-mode', this.mode);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    if (persist) {
      this.saveMode(this.mode);
    }

    this.updateThemeColorMeta(theme);
    this.updateToggleButtons();
    this.updateSystemThemeListener();
  }

  /**
   * Saves selected mode
   *
   * @param {string} mode
   */
  saveMode(mode) {
    try {
      this.storage.set(mode);
    } catch (e) {
      // localStorage is not available
    }
  }

  /**
   * Binds click handlers to toggle buttons
   */
  bindToggleButtons() {
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');

    toggleButtons.forEach((button) => {
      if (button.dataset.themeToggleBound === 'true') {
        return;
      }

      button.addEventListener('click', () => this.switchToNextMode());
      button.dataset.themeToggleBound = 'true';
    });

    this.updateToggleButtons();
  }

  /**
   * Switches to next mode from MODE_ORDER
   */
  switchToNextMode() {
    const currentModeIndex = MODE_ORDER.indexOf(this.mode);
    const nextModeIndex = (currentModeIndex + 1) % MODE_ORDER.length;
    const nextMode = MODE_ORDER[nextModeIndex];

    this.applyMode(nextMode);
  }

  /**
   * Syncs toggle button text and a11y attrs
   */
  updateToggleButtons() {
    const label = MODE_LABELS[this.mode] || MODE_LABELS[MODE_SYSTEM];
    const themeToggleText = `Theme: ${label}`;
    const themeToggleLabel = `Switch color theme. Current mode: ${label}`;

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.textContent = themeToggleText;
      button.setAttribute('aria-label', themeToggleLabel);
      button.setAttribute('title', themeToggleText);
    });
  }

  /**
   * Updates system theme listener according to the mode
   */
  updateSystemThemeListener() {
    if (!this.mediaQuery) {
      return;
    }

    if (this.mode === MODE_SYSTEM && !this.systemListenerBound) {
      this.systemListenerBound = true;
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
      } else {
        this.mediaQuery.addListener(this.handleSystemThemeChange);
      }
    }

    if (this.mode !== MODE_SYSTEM && this.systemListenerBound) {
      this.systemListenerBound = false;
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
      } else {
        this.mediaQuery.removeListener(this.handleSystemThemeChange);
      }
    }
  }

  /**
   * Handles prefers-color-scheme updates while in "system" mode
   */
  handleSystemThemeChange() {
    if (this.mode !== MODE_SYSTEM) {
      return;
    }

    this.applyMode(MODE_SYSTEM, { persist: false });
  }

  /**
   * Updates current theme-color meta value
   *
   * @param {string} theme
   */
  updateThemeColorMeta(theme) {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeColorMeta) {
      return;
    }

    themeColorMeta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS[MODE_LIGHT]);
  }
}
