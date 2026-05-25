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
    "version": "0.1.1",
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

In the SignalK server admin UI, open **Appstore → Available** and look for
**WilhelmSK Documentation** (the WilhelmSK app icon, by David Lewis). Searching
the list for `wilhelm` or `documentation` will find it. The entry shows the
short description — *"serves the WilhelmSK documentation site and an
installation-detection endpoint for the WilhelmSK iOS app"* — a version number,
and an **Install** button.

Click **Install**, then restart the server when the admin UI prompts you. There
are no configuration options — the docs start serving immediately, and the
plugin appears afterward under **Appstore → Installed**.

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

## Reading the docs

There are two ways to get to the documentation, and **the first one needs
nothing but a web browser** — the WilhelmSK app is not required.

### Directly in a browser (no app needed)

Once the plugin is installed, the full documentation site is live on your
server. From any phone, tablet, or laptop on the boat's network, open:

```
http://<your-signalk-host>:3000/signalk-wilhelmsk-docs/
```

(substitute your server's address — e.g. `http://signalk.local:3000/signalk-wilhelmsk-docs/`
or its LAN IP). It also shows up in the SignalK admin UI under the **Webapps**
menu as a launchable web app. Because it's served as a standard static site, it
works on the boat with no internet connection, and it does not depend on the
plugin being "enabled" in plugin config — installing the package is enough.

### From inside WilhelmSK

The WilhelmSK iOS/iPadOS app can open this same server-hosted copy from
**Settings → Help / Documentation** with the source set to **SignalK Server**,
so the help is available in-app and offline. (This relies on the app build that
includes the in-app documentation-source picker; until that ships, use the
browser method above — it works with any version.)

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
