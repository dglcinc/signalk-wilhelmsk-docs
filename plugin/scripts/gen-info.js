#!/usr/bin/env node
//
// Stages the plugin's non-doc runtime files into plugin/public/:
//
//   * info.json  - a small version/info file (reports the installed plugin
//                  version and docs path) on the open static docs route
//                  (/signalk-wilhelmsk-docs/info.json), not under the
//                  security-gated /plugins/* namespace, so it needs no token.
//   * icon.png   - the webapp icon shown on the SignalK server's WebApps page.
//                  package.json's signalk.appIcon is resolved relative to the
//                  served public/ dir, so the icon must live there (the source
//                  of truth is assets/icon.png, copied in here).
//   * screenshot.png - App Store listing screenshot (signalk.screenshots),
//                  resolved the same public/-relative way as appIcon. Source of
//                  truth is assets/screenshot.png.
//
// Run after `mkdocs build` (which cleans public/), so build-docs and CI both
// invoke this. Output is deterministic, keeping the committed copy in sync with
// what verify-plugin-docs.yml rebuilds.

const fs = require('fs')
const path = require('path')

const pkg = require(path.join(__dirname, '..', 'package.json'))
const pluginDir = path.join(__dirname, '..')
const outDir = path.join(pluginDir, 'public')

const info = {
  id: pkg.name,
  version: pkg.version,
  docsPath: '/signalk-wilhelmsk-docs/'
}

fs.mkdirSync(outDir, { recursive: true })

const infoFile = path.join(outDir, 'info.json')
fs.writeFileSync(infoFile, JSON.stringify(info, null, 2) + '\n')
console.log('wrote ' + infoFile + ' (version ' + pkg.version + ')')

for (const asset of ['icon.png', 'screenshot.png']) {
  const dest = path.join(outDir, asset)
  fs.copyFileSync(path.join(pluginDir, 'assets', asset), dest)
  console.log('copied ' + dest)
}
