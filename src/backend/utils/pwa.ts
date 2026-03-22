import fs from 'fs';
import path from 'path';
import type { AppConfig } from './appConfig.js';
import type { FaviconData } from './downloadFavicon.js';

type FrontendConfig = AppConfig['frontend'];

interface CustomIconDefinition {
  filename: string;
  sizes: string;
}

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

const CUSTOM_ICON_DEFINITIONS: CustomIconDefinition[] = [
  {
    filename: 'icon-192.png',
    sizes: '192x192',
  },
  {
    filename: 'icon-512.png',
    sizes: '512x512',
  },
];

const CUSTOM_ICONS_DIR = path.join('public', 'pwa');
const MANIFEST_FIELD_SHORT_NAME = 'short_name';
const MANIFEST_FIELD_START_URL = 'start_url';
const MANIFEST_FIELD_BACKGROUND_COLOR = 'background_color';
const MANIFEST_FIELD_THEME_COLOR = 'theme_color';

export const THEME_STORAGE_KEY = 'docs_theme_mode';
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#0f1622',
};

/**
 * Normalizes basePath.
 * "/" becomes an empty prefix.
 *
 * @param basePath - frontend base path
 */
function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') {
    return '';
  }

  const withLeadingSlash = basePath.startsWith('/')
    ? basePath
    : `/${basePath}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

/**
 * Prefixes any path with frontend.basePath.
 *
 * @param basePath - frontend base path
 * @param pathname - absolute pathname (starting from "/")
 */
export function withBasePath(basePath: string, pathname: string): string {
  const normalizedPathname = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;
  const normalizedBasePath = normalizeBasePath(basePath);

  return `${normalizedBasePath}${normalizedPathname}`;
}

/**
 * Checks that all expected custom icon files exist.
 *
 * @param cwd - current working directory
 */
function hasCustomIcons(cwd: string): boolean {
  return CUSTOM_ICON_DEFINITIONS.every(({ filename }) => {
    const iconPath = path.join(cwd, CUSTOM_ICONS_DIR, filename);

    return fs.existsSync(iconPath);
  });
}

/**
 * Returns icon list for manifest.
 * Uses custom icons from public/pwa when available, otherwise falls back to favicon.
 *
 * @param frontend - frontend config
 * @param favicon - optional resolved favicon data
 * @param cwd - current working directory
 */
export function getManifestIcons(
  frontend: FrontendConfig,
  favicon?: Partial<FaviconData>,
  cwd = process.cwd()
): ManifestIcon[] {
  const distPrefix = withBasePath(frontend.basePath, '/dist');

  if (hasCustomIcons(cwd)) {
    return CUSTOM_ICON_DEFINITIONS.map(({ filename, sizes }) => ({
      src: `${distPrefix}/pwa/${filename}`,
      sizes,
      type: 'image/png',
      purpose: 'any maskable',
    }));
  }

  return [
    {
      src: favicon?.destination || `${distPrefix}/favicon.png`,
      sizes: '64x64',
      type: favicon?.type || 'image/png',
      purpose: 'any',
    },
  ];
}

/**
 * Builds web app manifest payload.
 *
 * @param frontend - frontend config
 * @param favicon - optional resolved favicon data
 * @param cwd - current working directory
 */
export function buildManifest(
  frontend: FrontendConfig,
  favicon?: Partial<FaviconData>,
  cwd = process.cwd()
): Record<string, unknown> {
  const startUrl = withBasePath(frontend.basePath, '/');

  return {
    id: startUrl,
    name: frontend.title || frontend.appName,
    [MANIFEST_FIELD_SHORT_NAME]: frontend.appName,
    description: frontend.description,
    [MANIFEST_FIELD_START_URL]: startUrl,
    scope: startUrl,
    display: 'standalone',
    [MANIFEST_FIELD_BACKGROUND_COLOR]: THEME_COLORS.light,
    [MANIFEST_FIELD_THEME_COLOR]: THEME_COLORS.light,
    icons: getManifestIcons(frontend, favicon, cwd),
  };
}

/**
 * Returns shell assets that can be cached by service worker.
 *
 * @param frontend - frontend config
 * @param favicon - optional resolved favicon data
 * @param cwd - current working directory
 */
export function getServiceWorkerShellAssets(
  frontend: FrontendConfig,
  favicon?: Partial<FaviconData>,
  cwd = process.cwd()
): string[] {
  const distPrefix = withBasePath(frontend.basePath, '/dist');
  const manifestPath = withBasePath(frontend.basePath, '/manifest.webmanifest');
  const iconAssets = getManifestIcons(frontend, favicon, cwd).map(({ src }) => src);

  return Array.from(new Set([
    `${distPrefix}/main.css`,
    `${distPrefix}/main.bundle.js`,
    manifestPath,
    ...iconAssets,
  ]));
}

/**
 * Builds service worker source code.
 *
 * @param frontend - frontend config
 * @param favicon - optional resolved favicon data
 * @param cwd - current working directory
 */
export function buildServiceWorker(
  frontend: FrontendConfig,
  favicon?: Partial<FaviconData>,
  cwd = process.cwd()
): string {
  const cacheName = `${frontend.appName}-shell-v1`;
  const distPrefix = withBasePath(frontend.basePath, '/dist/');
  const apiPrefix = withBasePath(frontend.basePath, '/api/');
  const manifestPath = withBasePath(frontend.basePath, '/manifest.webmanifest');
  const serviceWorkerPath = withBasePath(frontend.basePath, '/sw.js');
  const shellAssets = getServiceWorkerShellAssets(frontend, favicon, cwd);

  return `
const CACHE_NAME = ${JSON.stringify(cacheName)};
const DIST_PREFIX = ${JSON.stringify(distPrefix)};
const API_PREFIX = ${JSON.stringify(apiPrefix)};
const MANIFEST_PATH = ${JSON.stringify(manifestPath)};
const SERVICE_WORKER_PATH = ${JSON.stringify(serviceWorkerPath)};
const SHELL_ASSETS = ${JSON.stringify(shellAssets)};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(SHELL_ASSETS.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (response && response.ok) {
          await cache.put(asset, response);
        }
      } catch (error) {
        // Skip unavailable assets during precache.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function shouldHandleRequest(request) {
  if (request.method !== 'GET') {
    return false;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    return false;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return false;
  }

  const pathname = url.pathname;

  if (pathname === SERVICE_WORKER_PATH) {
    return false;
  }

  if (pathname.startsWith(API_PREFIX)) {
    return false;
  }

  if (pathname === MANIFEST_PATH) {
    return true;
  }

  return pathname.startsWith(DIST_PREFIX);
}

async function fetchAndCache(request) {
  const response = await fetch(request);

  if (!response || !response.ok) {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());

  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!shouldHandleRequest(request)) {
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    try {
      return await fetchAndCache(request);
    } catch (error) {
      return cached;
    }
  })());
});
`.trim();
}

/**
 * Writes manifest and service worker files for static export.
 *
 * @param outputDir - static output directory
 * @param frontend - frontend config
 * @param favicon - optional resolved favicon data
 * @param cwd - current working directory
 */
export async function writeStaticPwaFiles(
  outputDir: string,
  frontend: FrontendConfig,
  favicon?: Partial<FaviconData>,
  cwd = process.cwd()
): Promise<void> {
  const normalizedBasePath = normalizeBasePath(frontend.basePath).replace(/^\/+/, '');
  const pwaOutputDir = normalizedBasePath
    ? path.resolve(outputDir, normalizedBasePath)
    : path.resolve(outputDir);
  const manifest = buildManifest(frontend, favicon, cwd);
  const serviceWorker = buildServiceWorker(frontend, favicon, cwd);

  await fs.promises.mkdir(pwaOutputDir, { recursive: true });
  await fs.promises.writeFile(
    path.join(pwaOutputDir, 'manifest.webmanifest'),
    JSON.stringify(manifest, null, 2),
    { encoding: 'utf-8' }
  );
  await fs.promises.writeFile(
    path.join(pwaOutputDir, 'sw.js'),
    serviceWorker,
    { encoding: 'utf-8' }
  );
}
