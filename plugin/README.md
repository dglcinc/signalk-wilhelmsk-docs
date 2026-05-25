# WilhelmSK Documentation (SignalK plugin)

A [SignalK](https://signalk.org/) node-server plugin that serves the
[WilhelmSK](https://wilhelmsk.com/) documentation site directly from your boat's
SignalK server, and ships a small static detection file the WilhelmSK iOS app
uses to confirm the plugin is installed.

WilhelmSK is the marine instrument display app for iOS, iPadOS, and watchOS.
Install this plugin and the app can offer in-app help straight from your own
SignalK server — no internet connection required once it's on the boat.

## What it does

- Serves the bundled MkDocs documentation site at `/signalk-wilhelmsk-docs/`.
- Works fully offline — the entire docs site ships with the plugin.
- Ships a static detection file at `/signalk-wilhelmsk-docs/info.json`:

  ```json
  {
    "id": "signalk-wilhelmsk-docs",
    "version": "0.1.0",
    "docsPath": "/signalk-wilhelmsk-docs/"
  }
  ```

  The WilhelmSK app can probe this (or just the docs root) to verify the plugin is
  available before pointing its in-app docs picker at
  `http://<host>:<port>/signalk-wilhelmsk-docs/`.

  **Why a static file and not a plugin endpoint:** SignalK mounts
  `registerWithRouter` routes under `/plugins/*`, which the server's security
  middleware gates behind authentication. The app probes for docs before any
  login, so detection lives on the open static docs route instead — no token
  required. `info.json` is generated from the plugin version by
  `scripts/gen-info.js` during `npm run build-docs`.

## Install

### From the SignalK App Store

Install **WilhelmSK Documentation** from the SignalK server admin UI
(Appstore → Available), then restart the server when prompted. There are no
configuration options — the docs start serving immediately.

### Manually (development)

```sh
cd ~/.signalk/node_modules
npm install /path/to/signalk-wilhelmsk-docs/plugin
# or symlink for local development:
ln -s /path/to/signalk-wilhelmsk-docs/plugin signalk-wilhelmsk-docs
```

Restart the SignalK server, then enable **WilhelmSK Documentation** under
Server → Plugin Config.

## Verify

```sh
curl http://localhost:3000/signalk-wilhelmsk-docs/info.json
curl -I http://localhost:3000/signalk-wilhelmsk-docs/
```

## Size

The plugin bundles the entire documentation site (so it works without internet
access on the boat). Everything ships inside the package — installing it adds
**nothing** to `node_modules` beyond the plugin's own folder, because it has no
runtime dependencies. So the installed footprint below is the whole cost:

| What | Size |
|------|------|
| Download (npm tarball, gzipped) | ~670 KB |
| Installed on disk | ~2.8 MB (54 files) |
| Extra `node_modules` dependencies | none |

Almost all of the on-disk size is the Material theme's bundled assets (fonts,
icons, JS, CSS — about 2.5 MB) plus the rendered HTML pages; the plugin code
itself is only a few KB. On a Raspberry Pi-class SignalK server — where the OS,
Node, and signalk-server already account for a few GB — under 3 MB of docs is
negligible and will fit comfortably on any install that runs SignalK at all.

## Documentation content

The `public/` directory holds the built MkDocs site. It is generated from the
`docs/` sources at the repository root via `mkdocs build -d plugin/public/`
(see the repo root `README.md` / `npm run build-docs`).

## License

MIT © 2026 David Lewis
