# signalk-wilhelmsk-docs (SignalK plugin)

A [SignalK](https://signalk.org/) node-server plugin that serves the WilhelmSK
documentation site directly from your SignalK server, and exposes a small
detection endpoint that the WilhelmSK iOS app uses to confirm the plugin is
installed.

## What it does

- Serves the bundled MkDocs documentation site at `/wilhelmsk-docs/`.
- Exposes `GET /plugins/signalk-wilhelmsk-docs/info` returning:

  ```json
  {
    "id": "signalk-wilhelmsk-docs",
    "version": "0.1.0",
    "docsPath": "/wilhelmsk-docs/"
  }
  ```

  The WilhelmSK app hits this endpoint to verify the plugin is available before
  pointing its in-app docs picker at `http://<host>:<port>/wilhelmsk-docs/`.

## Install

### From the SignalK App Store

Once published, install **WilhelmSK Documentation** from the SignalK server
admin UI (Appstore → Available).

### Manually (development)

```sh
cd ~/.signalk/node_modules
npm install /path/to/signalk-wilhelmsk-docs/plugin
# or symlink for local development:
ln -s /path/to/signalk-wilhelmsk-docs/plugin signalk-wilhelmsk-docs
```

Restart the SignalK server, then enable **WilhelmSK Documentation** under
Server → Plugin Config. There are no configuration options.

## Verify

```sh
curl http://localhost:3000/plugins/signalk-wilhelmsk-docs/info
curl -I http://localhost:3000/wilhelmsk-docs/
```

## Documentation content

The `public/` directory holds the built MkDocs site. It is generated from the
`docs/` sources at the repository root via `mkdocs build -d plugin/public/`
(see the repo root `README.md` / `npm run build-docs`). The placeholder
`.gitkeep` is replaced by real content in the docs-bundling step.

## License

MIT © 2026 David Lewis
