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
      'Serves the WilhelmSK app documentation at ' +
      DOCS_MOUNT +
      '/, so in-app help and direct browser access work without an internet connection.',

    // No user-configurable options. SignalK's admin UI renders the schema
    // description as plain text (RJSF v5 with a custom FieldTemplate that emits
    // <p>{description}</p> — HTML and markdown are both escaped), so a clickable
    // link can't live here. Point users at the Webapps menu instead (a real
    // clickable launcher, present via the signalk-webapp keyword) and show the
    // path for direct browsing.
    schema: {
      type: 'object',
      description:
        'No configuration needed — the documentation is served as soon as this ' +
        'plugin is installed. Open "WilhelmSK Documentation" from the Webapps ' +
        'menu, or browse to /signalk-wilhelmsk-docs/ on this server.',
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

  // A small version/info file is served at /signalk-wilhelmsk-docs/info.json
  // (generated into public/ by scripts/gen-info.js at build time). It lives on
  // the open static route rather than a registerWithRouter endpoint under
  // /plugins/*, which SignalK's security middleware would gate behind
  // authentication — so it (and the docs root) can be reached without a login.

  return plugin
}
