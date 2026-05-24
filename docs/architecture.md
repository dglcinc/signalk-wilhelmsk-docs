# Architecture Overview

A contributor-facing overview of how WilhelmSK is structured — repo layout, data flow, key subsystems, and security model.

---

## Repository Layout

```
Core/Classes/
  Common/        Shared gauge model, settings, SignalK data model, alarms
    Boat/          Vessel data store and WebSocket/REST client
    GaugeConfig/   Abstract gauge configuration (91 concrete subclasses)
    Gauges/        Gauge type definitions
    Settings/      User preferences and persistence
    Util/          Shared utilities
  iOS/           UIKit gauge views and rendering
    GaugeUI/       Gauge view rendering
    WMGaugeView/   Analog dial drawing (ObjC CoreGraphics)
Wilhelm/                  Main iOS app — VCs, storyboards, Swift helpers
Wilhelm/Swift/            13 Swift files (iOS-only: AnchorGauge, etc.)
WilhelmSKWidgets/         WidgetKit extensions (22 Swift files)
WilhelmSKWatch Watch App/ New watchOS app (SwiftUI, 8 Swift files)
WilhelmSKWatch Widgets/   watchOS complications (2 Swift files)
SignalKClient/            SignalK connection layer
SBJson/                   JSON parsing (vendored)
SocketRocket/             WebSocket client (vendored)
FFMpegDecoder/            RTSP/IP camera decoding
Libs/                     Vendored CocoaPods (formerly sibling repos)
```

**Language split:** ~81% Objective-C, ~9% Swift. The ObjC core is the gauge engine and SignalK client; Swift/SwiftUI is used for the new watch app and WidgetKit extensions.

---

## Build Targets

| Target | Platform |
|---|---|
| `WilhelmSK` | iOS (main app) |
| `WilhelmTV` | tvOS |
| `WilhelmSKWatch Watch App` | watchOS 9+ (SwiftUI) |
| `WilhelmSKWatch WidgetsExtension` | watchOS complications |
| `WilhelmSKWidgetsExtension` | iOS WidgetKit |
| `WilhelmSKPushProvider` | iOS local push notification extension |

The legacy `WilhelmWatch`/`WilhelmWatch Extension` watchOS 4 targets were removed on `development`.

---

## Data Flow Pipeline

This is the path from a SignalK server delta to pixels on screen:

```
Bonjour / manual configuration
    → server selection
    → WebSocket stream (primary) or REST poll (fallback)
    → delta messages parsed in SignalKSource.m
         – keyed by SignalK path into vesselData (NSMutableDictionary)
         – freshness timestamp stored in lastModifies per path
    → refreshDelegates: called with the list of changed paths
    → each active gauge / view controller:
         1. checks whether its required paths are in the changed list
         2. calls Boat.getValueForPath:sourceUnits:unitsType:valueType:
            (unit conversion happens here, transparently)
         3. updates UI
```

Unit conversion is centralised in `Boat.getValueForPath:` — gauge code never converts units itself.

The live instrument store (`vesselData`) is entirely in-memory. There is no disk cache of last-known values; gauges show no data until the first delta arrives after connect.

---

## The Gauge System

`GaugeConfig` is an abstract Objective-C base class. Each of the 91 concrete subclasses (in `Core/Classes/Common/Gauges/`) declares:

- Which SignalK path(s) it reads
- Which `UIView` subclass renders it
- Default title, category, and display options

A `gauges.json` manifest in the main bundle describes the gauge picker categories and factory defaults. Pages and layouts are stored as JSON arrays in `NSUserDefaults`, keyed by layout name and platform (`pages.<layoutName>.<ui>`).

The factory pattern means adding a new gauge type is a focused task: create a subclass of `GaugeConfig`, register it in `gauges.json`, implement a `UIView` renderer, and wire up the SignalK path(s). No changes to the core infrastructure are required.

---

## Platform Layering

```
Core/Classes/Common/    ← compiled into all targets (iOS, tvOS, watchOS)
Core/Classes/iOS/       ← iOS and tvOS rendering only
Wilhelm/                ← main iOS app (no watchOS/tvOS)
WilhelmSKWidgets/       ← WidgetKit (iOS only)
WilhelmSKWatch Watch App/ ← watchOS (SwiftUI)
```

`Core/Classes/Common/` is intentionally platform-agnostic. It uses no UIKit or SwiftUI directly, which is why the same gauge configuration model compiles cleanly across iOS, tvOS, and watchOS.

---

## Persistence Model

There are four distinct stores, each with a defined scope:

| Store | What it holds | Scope |
|---|---|---|
| `NSUserDefaults` (standard) | Page layouts, per-layout last-page index, raw connection preferences | Main iOS app only |
| `NSUserDefaults` (App Group `group.com.scottbender.wilhelm`) | Active connection, widget gauge list, watch gauge list, unit preferences | All extensions + watch |
| `NSUbiquitousKeyValueStore` (iCloud KV) | Manual connection definitions | All devices (iCloud sync) |
| Keychain (`com.scottbender.WilhelmSK`) | APNs device token | Main app + WidgetKit extensions |

**iCloud sync is partial:** connection definitions sync across devices; page layouts do not. A custom layout created on iPhone will not appear on iPad.

`layouts.json` in the main bundle holds factory-default page templates. It is read-only — loaded once at startup into `Settings.pageLayouts`, never written.

---

## watch/Widget Data Flow

```
SignalK server
    ↓ WebSocket / REST (in main app)
Main app (iOS)
    ↓ writes to App Group UserDefaults on each data tick
WidgetKit timeline provider
    ↓ reads App Group UserDefaults on WidgetKit schedule (~15 min)
Widget UI rendered

Main app ←→ WCSession ←→ Watch app (watchOS)
    sendMessage:          initial handshake (watch requests connection list)
    applicationContext:   configuration updates (latest-only, drops older)
    transferUserInfo:     live gauge values at ~2 Hz (queued, in-order delivery)
```

The watch uses all three WCSession channels deliberately: `sendMessage` for the connection handshake, `updateApplicationContext` for gauge configuration (where dropping stale updates is fine), and `transferUserInfo` for the data stream (where delivery order matters).

**Standalone mode (no phone):** When WCSession is not reachable, the watch connects directly to the SignalK server via HTTP REST polling using `WidgetBoat: RESTSignalK` from `WilhelmSKLibrary`. This requires the watch and server to be on the same Wi-Fi. Non-SignalK connection types (Victron/Venus MQTT, Raymarine) still require the phone because their protocol clients live in the iOS app.

**Widget freshness:** WidgetKit extensions refresh on Apple's timeline schedule, typically every 15 minutes. There is no mechanism to push a live update from the main app to a widget.

---

## Networking

The app supports multiple connection types:

| Protocol | Class | Notes |
|---|---|---|
| SignalK WebSocket | `SignalK.m` (SocketRocket) | Primary streaming transport |
| SignalK REST | `SignalK.m` | Fallback polling; also used by watch standalone mode |
| NMEA 0183/2000 | `CANboatSource` + `iosparse.js` | CANboat protocol |
| MQTT (Victron/Venus) | `Venus.m` (MQTTClient) | Local or VRM cloud |
| Raymarine Ray2MQTT | `RayCommunication.m` | Requires sbender9 server plugin |

Bonjour discovery is via `NSNetServiceBrowser`. Both HTTP Basic and JWT token auth are supported.

**Auto-reconnect:** There is currently no automatic reconnect on WebSocket close. When the server drops, the app stops updating silently. The `webSocket:didCloseWithCode:` handler in `SignalK.m` fires the delegate but does not schedule a retry. Implementing exponential-backoff reconnect there is the most operationally impactful improvement available for contributors.

---

## Alarm Subsystem

Server-side alarms arrive as `notifications.*` delta updates and are stored in `Boat.notifications` (keyed by path → source → `SignalKNotification`). The `TopBarHandler` reflects alarm severity (red/yellow/gray) based on `hasAlarms()`, `hasWarnings()`, and `hasNonNormalAlarms()` computed from this dictionary.

Local zone alarms are evaluated per-gauge: each gauge checks whether its current value falls within a configured zone range and fires a local notification if so. Zones are stored in `NSUserDefaults` as metadata alongside gauge configuration.

Anchor alarm monitoring is handled by `AnchorAlarmControl.m`, which sends a drop-anchor command to the server-side `signalk-anchoralarm-plugin`. The plugin raises a `notifications.anchoralarm.*` notification when drift exceeds the configured radius, which the app receives as a normal server-side alarm.

---

## Key Classes

| Class | Size | Role |
|---|---|---|
| `Boat.m` | 3,719 LOC | Master data store, WebSocket/REST client, delegate manager, alarm state, unit conversion, autopilot commands |
| `SignalKSource.m` | — | Delta message parsing; `vesselData` population; freshness tracking |
| `Settings.m` | — | Singleton; all user preferences and layout persistence |
| `SignalKNotification.h/m` | — | Alarm data model (path, severity, methods, ack/silence state) |
| `GaugeConfig.m` | — | Abstract gauge configuration base class |
| `SessionHandler.swift` | 337 LOC | watchOS WCSession lifecycle and App Group state |
| `WidgetBoat.swift` | — | WidgetKit + watch data source (reads App Group UserDefaults) |

`Boat.m` handles too many concerns for its size — data storage, networking, delegate management, alarm state, unit conversion, and autopilot commands are all in one class. It is safe to add to and extend; any significant refactoring should be coordinated with the maintainer on the Signal K Discord before starting.

---

## Security Notes

Contributors adding or modifying network code should be aware of the following design choices.

**SSL/TLS certificate validation is intentionally permissive.** `SignalK.m` passes `allowsUntrustedSSLCertificates:YES` to SocketRocket, and `Venus.m` sets `allowInvalidCertificates = YES` on the MQTT SSL policy. This is a deliberate tradeoff for the marine context: boat networks commonly use self-signed certificates, and prompting users to validate certificates on a rocking boat in the dark is not practical. Any new network transport added to the codebase should follow the same pattern for consistency, with a per-connection opt-in to strict validation if the server supports it.

**Credential storage.** JWT tokens and HTTP Basic passwords are stored as part of the connection dictionary in `NSUserDefaults` (including the shared App Group suite readable by widget and watch extensions). Manual connection definitions, including credentials, are synced to iCloud KV via `NSUbiquitousKeyValueStore`. The APNs device token is the only credential currently stored in the Keychain (`com.scottbender.WilhelmSK`). Contributors working on authentication or connection persistence should be aware that migrating credentials to the Keychain would require coordinating entitlement changes across all targets.

**API keys.** Third-party API keys (Google Maps, ActiveCaptain) are currently hardcoded in source. The correct long-term approach is to move these to an `xcconfig` file excluded from version control; for now, treat them as known and do not rotate or replace them without coordinating with the maintainer.

**Input validation.** Values arriving in SignalK delta messages are not range-checked before reaching gauge renderers. Gauge code that consumes server-supplied values should be written defensively — check for `nil`, unexpected types, and out-of-range numbers before using a value in layout or drawing code.