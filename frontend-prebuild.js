import fs from 'fs'
import * as process from 'process';
import path from 'path';
import { loadConfig } from '@codex-team/config-loader';

function updateFrontendConf() {
  const configPath = path.join(process.cwd(), './docs-config.yaml');
  const loadedConfig = loadConfig(...[configPath]);
  const loadedFrontendConfig = loadedConfig['frontend']

  if (!loadedConfig || !loadedFrontendConfig) return

  let config = readFile('./frontend-config.template.js')
  config = config.replace('${basePath}', loadedFrontendConfig['basePath'])

  writeFile('./frontend-config.js', config)
}

function readFile(path) {
  let file = null;

  try {
    file = fs.readFileSync(path, { encoding: 'utf8' });
  } catch (err) {
    console.log(err);
  }

  return file
}

function writeFile(path, file) {
  try {
    fs.writeFileSync(path, file, { encoding: 'utf8' });
  } catch (err) {
    console.log(err);
  }
}

updateFrontendConf()