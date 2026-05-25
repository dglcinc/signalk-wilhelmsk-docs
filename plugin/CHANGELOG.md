# Changelog

## 0.1.5

- App Store: rewrote the plugin description to focus on the real value — offline
  docs on the boat — and dropped the inaccurate "installation-detection" wording.
- App Store: added category keywords (`utility`, `instruments`, `notifications`,
  `ais`) and a listing screenshot (`signalk.screenshots`).
- Enabled the plugin by default on install (`signalk-plugin-enabled-by-default`)
  so the docs serve immediately.
- Added this CHANGELOG.

## 0.1.4

- Tolerate a malformed `user-guide//` (double-slash) URL produced by current
  WilhelmSK builds: an inline redirect collapses the duplicate slash so the
  in-app docs load fully styled with working anchor scrolling. (App-side fix in
  sbender9/Wilhelm#100.)

## 0.1.3

- Fixed the WebApps icon: `signalk.appIcon` is resolved relative to the served
  `public/` directory, so the icon now displays instead of a placeholder; added
  a docs-specific icon.
- Switched to the system sans-serif font instead of fetching Google Fonts, so
  the documentation renders correctly with no internet connection.
- Added the in-app help deep-link scroll helper.

## 0.1.2

- Show the plugin's config description as plain text (the SignalK admin UI
  escapes HTML and markdown).

## 0.1.0 – 0.1.1

- Initial release: serves the bundled WilhelmSK MkDocs documentation site at
  `/signalk-wilhelmsk-docs/` (fully offline) plus an `info.json` version file,
  with App Store packaging (keywords, `displayName`, `appIcon`, author).
