const path = require('path')
const express = require('express')

const PLUGIN_ID = 'signalk-wilhelmsk-docs'
const DOCS_MOUNT = '/signalk-wilhelmsk-docs'

module.exports = function (app) {
  const publicDir = path.join(__dirname, 'public')

  const plugin = {
    id: PLUGIN_ID,
    name: 'WilhelmSK Documentation',
    description:
      'Serves the WilhelmSK documentation site at ' +
      DOCS_MOUNT +
      '/ and exposes an info endpoint the WilhelmSK iOS app uses to detect the plugin.',

    // No user-configurable options; the schema is intentionally empty.
    schema: {
      type: 'object',
      properties: {}
    },

    start: function () {
      // Serve the bundled MkDocs site as static files.
      app.use(DOCS_MOUNT, express.static(publicDir))
      app.debug && app.debug('Serving WilhelmSK docs from %s at %s', publicDir, DOCS_MOUNT)
      app.setPluginStatus &&
        app.setPluginStatus('Serving docs at ' + DOCS_MOUNT + '/')
    },

    stop: function () {
      // express.static routes registered via app.use cannot be cleanly
      // unregistered on the SignalK app; a server restart clears them.
      app.setPluginStatus && app.setPluginStatus('Stopped')
    }
  }

  // Note: detection is served as a static file at
  // /signalk-wilhelmsk-docs/info.json (generated into public/ by
  // scripts/gen-info.js at build time). It deliberately lives on the open
  // static route rather than a registerWithRouter endpoint under /plugins/*,
  // which SignalK's security middleware would gate behind authentication —
  // the WilhelmSK app probes it before any login.

  return plugin
}
