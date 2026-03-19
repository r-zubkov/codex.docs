# CodeX Docs (Fork)

[CodeX Docs](https://docs.codex.so/) is a documentation app built on the Editor.js ecosystem.

This repository is an independent fork focused on project-specific improvements.

![page-overview-bright](https://user-images.githubusercontent.com/3684889/190149130-6a6fcdec-09bc-4f96-8bdc-5ff4d789f248.png)

## Fork Notice

This project is forked from the original [codex-team/codex.docs](https://github.com/codex-team/codex.docs).

Main fork differences:

- Extended Editor.js stack and rendering with extra tools/plugins, including `@editorjs/quote`, `editorjs-toggle-block`, and `editorjs-superscript`
- Added support for deployment under sub-URL (for example `/docs`) via `frontend.basePath`, including routes, assets, auth redirects and API endpoints
- Added optional SOCKS proxy support for external links metadata fetching (`frontend.isUseSocksProxy` + `socksProxy` with whitelist support)
- Increased backend payload limits for JSON and URL-encoded requests to `5mb`
- Improved table of contents behavior and styles for long pages
- Removed built-in analytics and error-report integrations in this fork

Fork config example:

```yaml
frontend:
  appName: "docs"
  basePath: "/docs" # Deploy app under sub-URL, for example https://example.com/docs
  isUseSocksProxy: true # Enable SOCKS proxy for external link metadata

socksProxy:
  ip: "127.0.0.1"
  port: "9050"
  user: ""
  password: ""
  whiteList: ["docs.codex.so"] # URLs from this list are requested without proxy
```

## Features

- 🤩 [Editor.js](https://editorjs.io/) ecosystem powered
- ✍️ Rich writing toolkit: Quotes, Toggle blocks, Checklists, Tables, Embeds and more
- 📂 Docs nesting — create any structure you need
- 🧭 Automatic table of contents for long pages
- 📱 Nice look on desktop and mobile
- 🔥 Beautiful page URLs. Human-readable and SEO-friendly
- 🚢 Deploy easily — local DB by default, no extra services required
- 🗄️ MongoDB support when you need an external database
- ☁️ Flexible uploads storage: local filesystem, static directory, or S3
- ⚙️ Tune UI as you need. Collapse sections, hide the sidebar

## Prerequisites

- Node.js `16.14.0` (see `.nvmrc`)
- Yarn `1.x`
- Docker + Docker Compose (optional)
- MongoDB (optional, only if `database.driver: mongodb`)

## Getting Started

### 1. Clone the repo

```shell
git clone https://github.com/r-zubkov/codex.docs
cd codex.docs
```

### 2. Install dependencies

```shell
yarn install
```

### 3. Configure

Use `docs-config.yaml` as the base config.

Create `docs-config.local.yaml` for local overrides:

```yaml
auth:
  password: "change-me"
  secret: "change-me-too"
```

### 4. Run

Development mode (backend with nodemon + frontend watch build):

```shell
yarn dev
```

Production-like local run:

```shell
yarn start
```

Using Docker:

```shell
docker-compose build
docker-compose up
```

Using Kubernetes:

Use the upstream Helm chart as a base:
[codex-team/codex.docs.chart](https://github.com/codex-team/codex.docs.chart)

## Security Notes

- Change default `auth.password` and `auth.secret` before any public deployment
- Keep secrets and proxy credentials in local/private config files, do not commit them
- Enable `frontend.isPrivate: true` if documentation must not be publicly readable

## Guides

- [Development guide](./DEVELOPMENT.md)
- [DB converter (local to MongoDB)](./bin/db-converter/README.md)
- Upstream docs reference: [docs.codex.so](https://docs.codex.so/)

## Credits

- Original project: [CodeX Docs by CodeX Team](https://github.com/codex-team/codex.docs)
- This fork is maintained independently and is not an official CodeX Team repository
