# signalk-wilhelmsk-docs

Documentation source and SignalK plugin for [WilhelmSK](https://github.com/sbender9/Wilhelm), the marine instrument display app. This monorepo holds the MkDocs documentation sources (published to [GitHub Pages](https://dglcinc.github.io/signalk-wilhelmsk-docs/)) and a [SignalK](https://signalk.org/) node-server plugin that serves the same documentation locally at `/signalk-wilhelmsk-docs/` so WilhelmSK can offer in-app help from either source.

- **Docs:** https://dglcinc.github.io/signalk-wilhelmsk-docs/
- **Plugin:** `plugin/` (SignalK node-server plugin `signalk-wilhelmsk-docs`)

## For contributors

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — how the WilhelmSK codebase is structured (developer reference)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — branching model and PR workflow

The user-facing MkDocs site at GitHub Pages intentionally does not include those — they're for contributors browsing this repo.
