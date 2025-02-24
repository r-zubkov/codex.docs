import { loadConfig } from '@codex-team/config-loader';
import * as process from 'process';
import arg from 'arg';
import path from 'path';
import { z } from 'zod';

/**
 * Config for local uploads driver
 */
const LocalUploadsConfig = z.object({
  driver: z.literal('local'),
  local: z.object({
    path: z.string(), // path to the database directory
  }),
});

/**
 * Config for local static uploads driver
 */
 const LocalStaticUploadsConfig = z.object({
  driver: z.literal('static'),
  static: z.object({
    serverPrefix: z.string(), // server prefix
    path: z.string(), // path to the database directory
  }),
});

/**
 * Config for S3 uploads driver
 */
const S3UploadsConfig = z.object({
  driver: z.literal('s3'),
  s3: z.object({
    bucket: z.string(),
    region: z.string(),
    baseUrl: z.string(),
    keyPrefix: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
  }),
});

export type LocalUploadsConfig = z.infer<typeof LocalUploadsConfig>;
export type LocalStaticUploadsConfig = z.infer<typeof LocalStaticUploadsConfig>;
export type S3UploadsConfig = z.infer<typeof S3UploadsConfig>;

/**
 * Config for local database driver
 */
const LocalDatabaseConfig = z.object({
  driver: z.literal('local'),
  local: z.object({
    path: z.string(), // path to the database directory
  }),
});

/**
 * Config for MongoDB database driver
 */
const MongoDatabaseConfig = z.object({
  driver: z.literal('mongodb'),
  mongodb: z.object({
    uri: z.string(), // MongoDB connection URI
  }),
});

/**
 * Config for authentication
 */
const AuthConfig = z.object({
  secret: z.string(), // Secret for JWT
  password: z.string(), // Password for admin panel
});

/**
 * Frontend configuration
 */
const FrontendConfig = z.object({
  isPrivate: z.boolean().default(false), // Show pages only in edit mode
  isUseSocksProxy: z.boolean().default(false), // Use socks proxy
  appName: z.string(), // App name
  basePath: z.string(), // Base path for routing
  title: z.string(), // Title for pages
  description: z.string(), // Description for pages
  startPage: z.string(), // Start page
  menu: z.array(z.union([
    z.string(),
    z.object({ title: z.string(), uri: z.string() })
  ])), // Menu for pages
});

/**
 * Socks Proxy configuration
 */
const SocksProxyConfig = z.object({
  ip: z.string(), // IP
  port: z.string(), // Port
  user: z.string(), // User
  password: z.string(), // Password
  whiteList: z.array(z.string()), // list of urls that will skip proxy
});

/**
 * Static build configuration
 */
const StaticBuildConfig = z.object({
  outputDir: z.string(), // Output directory for static build
  overwrite: z.boolean().optional().default(true),
  indexPage: z.object({
    enabled: z.boolean(), // Is index page enabled
    uri: z.string(), // Index page uri
  }),
});

export type StaticBuildConfig = z.infer<typeof StaticBuildConfig>;

/**
 * Application configuration
 */
const AppConfig = z.object({
  port: z.number(), // Port to listen on
  host: z.string(), // Host to listen on
  favicon: z.string().optional(), // Path or URL to favicon
  uploads: z.union([LocalUploadsConfig, LocalStaticUploadsConfig, S3UploadsConfig]), // Uploads configuration
  frontend: FrontendConfig, // Frontend configuration
  auth: AuthConfig, // Auth configuration
  database: z.union([LocalDatabaseConfig, MongoDatabaseConfig]), // Database configuration
  socksProxy: SocksProxyConfig.optional(), // Socks Proxy configuration
  staticBuild: StaticBuildConfig.optional(), // Static build configuration
});

export type AppConfig = z.infer<typeof AppConfig>;

const defaultConfig: AppConfig = {
  'port': 3000,
  'host': 'localhost',
  'uploads': {
    'driver': 'local',
    'local': {
      'path': './uploads',
    },
  },
  'frontend': {
    'isPrivate': false, 
    'isUseSocksProxy': false,
    'appName': 'docs',  
    'basePath': '/docs',
    'title': 'Docs',
    'description': 'Docs app',
    'startPage': '',
    'menu': [],
  },
  'auth': {
    'secret': 'supersecret',
    'password': 'secretpassword',
  },
  'database': {
    'driver': 'local',
    'local': {
      'path': './db',
    },
  },
};

const args = arg({ /* eslint-disable @typescript-eslint/naming-convention */
  '--config': [ String ],
  '-c': '--config',
});

const cwd = process.cwd();
const paths = (args['--config'] || [ './docs-config.yaml' ]).map((configPath) => {
  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  return path.join(cwd, configPath);
});

const loadedConfig = loadConfig(...[defaultConfig, ...paths]);

const appConfig = AppConfig.parse(loadedConfig);

export default appConfig;
