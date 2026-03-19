# CodeX Docs

[CodeX Docs](https://docs.codex.so/) is a free docs application. It's based on Editor.js ecosystem which gives all modern opportunities for working with content.

You can use it for product documentation, for internal team docs, for personal notes or any other need.

![page-overview-bright](https://user-images.githubusercontent.com/3684889/190149130-6a6fcdec-09bc-4f96-8bdc-5ff4d789f248.png)

It's super easy to install and use.

## Fork Notice

This repository is a fork of the original [CodeX Docs](https://github.com/codex-team/codex.docs).

It keeps the original product idea and architecture, with additional project-specific improvements.

Main fork differences:

- Extended Editor.js stack and rendering with extra tools/plugins, including `@editorjs/quote`, `editorjs-toggle-block`, and `editorjs-superscript`
- Added support for deployment under sub-URL (for example `/docs`) via `frontend.basePath`, including routes, assets, auth redirects and API endpoints
- Added optional SOCKS proxy support for external links metadata fetching (`frontend.isUseSocksProxy` + `socksProxy` with whitelist support)
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
- 🧭 Automatic Table of contents for long pages
- 📱 Nice look on Desktop and Mobile
- 🔥 Beautiful page URLs. Human-readable and SEO-friendly.
- 🚢 Deploy easily — local DB by default, no extra services required
- 🗄️ MongoDB support when you need external database
- ☁️ Flexible uploads storage: local filesystem, static directory, or S3
- 🧅 Optional SOCKS proxy for external links metadata fetching
- 🤙 Simple configuration
- ⚙️ Tune UI as you need. Collapse sections, hide the Sidebar

## Demo

Here is our [Demo Application](https://docs-demo.codex.so/) where you can try CodeX Docs in action.

## Guides

1. [Getting Started](https://docs.codex.so/getting-started)
2. [Configuration](https://docs.codex.so/configuration)
3. [Kubernetes deployment](https://docs.codex.so/k8s-deployment)
4. [Authentication](https://docs.codex.so/authentication)
5. [Writing](https://docs.codex.so/writing)
6. [Development guide](./DEVELOPMENT.md)
7. [DB converter (local to MongoDB)](./bin/db-converter/README.md)
8. [Contribution guide](https://docs.codex.so/contribution)

## Getting Started

### 1. Clone the repo.

```shell
git clone https://github.com/r-zubkov/codex.docs
```

### 2. Fill the config

Read about available [configuration](https://docs.codex.so/configuration) options.

For local overrides, create `docs-config.local.yaml`.

### 3. Run the application

#### Using Yarn

```shell
yarn && yarn start
```

#### For local development

```shell
yarn install
yarn dev
```

#### Using Docker

```
docker-compose build
docker-compose up
```

#### Using Kubernetes

We have the ready-to-use [Helm chart](https://github.com/codex-team/codex.docs.chart) to deploy project in Kubernetes

## Development

See documentation for developers in [DEVELOPMENT.md](./DEVELOPMENT.md).

## Optional SOCKS Proxy for Link Metadata

CodeX Docs can fetch external links metadata through SOCKS proxy.

```yaml
frontend:
  isUseSocksProxy: true

socksProxy:
  ip: "127.0.0.1"
  port: "9050"
  user: ""
  password: ""
  whiteList: ["docs.codex.so"]
```

# About CodeX

<img align="right" width="120" height="120" src="https://codex.so/public/app/img/codex-logo.svg" hspace="50">

CodeX is a team of digital specialists around the world interested in building high-quality open source products on a global market. We are [open](https://codex.so/join) for young people who want to constantly improve their skills and grow professionally with experiments in cutting-edge technologies.

| 🌐                           | Join 👋                                | Twitter                                      | Instagram                                      |
| ---------------------------- | -------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| [codex.so](https://codex.so) | [codex.so/join](https://codex.so/join) | [@codex_team](http://twitter.com/codex_team) | [@codex_team](http://instagram.com/codex_team) |
