# Changelog

## 0.1.7

- Docs: **Anchor Alarm** — documented the new anchor-deployment **Live Activity**
  (iPhone Lock Screen, Dynamic Island, and the Apple Watch Smart Stack on
  watchOS 11+); requires the `signalk-push-notifications` plugin.
- Docs: **Alarms** — documented the Silence / Acknowledge / Clear-All bulk
  actions in the Alerts list.
- Docs: **Maps** — the Navionics gauge now supports North/Head/Course Up
  orientation.
- Docs: **Pages** — noted that map pages page with a two-finger swipe (a single
  finger pans the chart).

## 0.1.6

- Docs: comprehensive **Gauge Reference** overhaul. Added five gauge types that
  were missing from the catalog (StaticThermostat, Raymarine MFD, WavyTank,
  AWA Close-Hauled, Watch Grid) and corrected the `StaticThermostat`/`Thermostat`
  humidity example.
- Docs: verified every gauge's SignalK path against the WilhelmSK source and
  fixed the wrong ones (Navigation `courseGreatCircle.*` and `navigation.attitude`
  members, engine `fuel.rate`/`fuel.economy`, the AWA-variant and ground-wind
  paths, the electrical battery instances, and more).
- Docs: added a plain-language description to every gauge (display style, and
  whether it is a control or read-only) and a SignalK path / source column to
  every section, plus a fixed-width layout that keeps the path column readable.

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
