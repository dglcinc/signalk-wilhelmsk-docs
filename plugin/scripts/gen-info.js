#!/usr/bin/env node
//
// Writes plugin/public/info.json, the unauthenticated detection artifact the
// WilhelmSK iOS app can probe to confirm the plugin is installed. It lives on
// the open static docs route (/signalk-wilhelmsk-docs/info.json), not under the
// security-gated /plugins/* namespace.
//
// Run after `mkdocs build` (which cleans public/), so build-docs and CI both
// invoke this. Output is deterministic: same package version => identical bytes,
// keeping the committed copy in sync with what verify-plugin-docs.yml rebuilds.

const fs = require('fs')
const path = require('path')

const pkg = require(path.join(__dirname, '..', 'package.json'))
const outDir = path.join(__dirname, '..', 'public')
const outFile = path.join(outDir, 'info.json')

const info = {
  id: pkg.name,
  version: pkg.version,
  docsPath: '/signalk-wilhelmsk-docs/'
}

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(info, null, 2) + '\n')
console.log('wrote ' + outFile + ' (version ' + pkg.version + ')')
