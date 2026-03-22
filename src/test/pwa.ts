import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import {
  buildManifest,
  buildServiceWorker,
  getServiceWorkerShellAssets,
  withBasePath,
} from '../backend/utils/pwa.js';

const frontendConfig = {
  isPrivate: false,
  isUseSocksProxy: false,
  appName: 'docs',
  basePath: '/docs',
  title: 'Docs',
  description: 'Docs app',
  startPage: '',
  menu: [],
};

describe('PWA utils', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-docs-pwa-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('builds manifest with basePath-aware start_url and scope', () => {
    const manifest = buildManifest(frontendConfig, undefined, tempDir) as any;

    expect(manifest.start_url).to.equal('/docs/');
    expect(manifest.scope).to.equal('/docs/');
  });

  it('uses favicon fallback icon when custom icons are missing', () => {
    const manifest = buildManifest(frontendConfig, {
      destination: '/docs/dist/custom-favicon.png',
      type: 'image/png',
    }, tempDir) as any;

    expect(manifest.icons).to.deep.equal([
      {
        src: '/docs/dist/custom-favicon.png',
        sizes: '64x64',
        type: 'image/png',
        purpose: 'any',
      },
    ]);
  });

  it('uses custom icons when expected files exist', () => {
    const customIconsDir = path.join(tempDir, 'public', 'pwa');

    fs.mkdirSync(customIconsDir, { recursive: true });
    fs.writeFileSync(path.join(customIconsDir, 'icon-192.png'), 'icon-192');
    fs.writeFileSync(path.join(customIconsDir, 'icon-512.png'), 'icon-512');

    const manifest = buildManifest(frontendConfig, undefined, tempDir) as any;

    expect(manifest.icons).to.deep.equal([
      {
        src: '/docs/dist/pwa/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/docs/dist/pwa/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ]);
  });

  it('builds service worker with static-only caching guards', () => {
    const serviceWorker = buildServiceWorker(frontendConfig, undefined, tempDir);

    expect(serviceWorker).to.contain('request.mode === \'navigate\' || request.destination === \'document\'');
    expect(serviceWorker).to.contain('pathname.startsWith(API_PREFIX)');
    expect(serviceWorker).to.contain('pathname.startsWith(DIST_PREFIX)');
    expect(serviceWorker).to.contain('pathname === MANIFEST_PATH');
  });

  it('returns basePath-safe shell assets', () => {
    const assets = getServiceWorkerShellAssets(frontendConfig, undefined, tempDir);

    expect(assets).to.include('/docs/dist/main.css');
    expect(assets).to.include('/docs/dist/main.bundle.js');
    expect(assets).to.include('/docs/manifest.webmanifest');
  });

  it('prefixes paths correctly for root and nested basePath', () => {
    expect(withBasePath('/docs', '/sw.js')).to.equal('/docs/sw.js');
    expect(withBasePath('/', '/sw.js')).to.equal('/sw.js');
  });
});
