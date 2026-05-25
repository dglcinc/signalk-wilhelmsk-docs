# WilhelmSK User Guide

Everything you need to set up and use WilhelmSK across all supported platforms. The table of contents above (or on the home page) is the fastest way to jump to a section.

---

## Before You Start

WilhelmSK is a display client — you'll connect it to a data source on your boat (or wherever the data lives). The full setup flow is in **Connecting to a Data Source** below. First, a few basics that apply regardless of which source you choose.

---

### Device Requirements

| Platform | Minimum Version |
|----------|----------------|
| iPhone / iPad | iOS 13 |
| Apple Watch | watchOS 10.6 |

---

### Installing WilhelmSK

Search "WilhelmSK" on the App Store. The app is a universal binary — one purchase covers iPhone and iPad. The Apple Watch app installs automatically from the iPhone app.

---

### Network Requirements

Whichever data source you use, your iOS device and the data source need to reach each other on the network. For most setups that means the same boat Wi-Fi or LAN.

WilhelmSK uses **Bonjour (mDNS)** to discover compatible servers and devices automatically. Most home and boat routers pass mDNS without configuration; some enterprise or managed switches block it. If auto-discovery doesn't find your server, you can always enter the address manually — covered in each Connecting section below.

For monitoring from outside the boat's network (cellular, marina Wi-Fi, shore), see [Remote Access](#remote-access) further down.

---

## Connecting to a Data Source

This is where most of your one-time setup happens. WilhelmSK can connect directly to a range of marine data products over your boat's network. All connections below are IP-based — Wi-Fi or Ethernet:

| Source | Best for |
|---|---|
| **SignalK server** | The flexible default — runs on a Raspberry Pi or similar, aggregates all your NMEA data, works with every WilhelmSK feature |
| **Victron Venus MQTT** | Victron Energy installations — batteries, inverters, solar, shore power. Local or via VRM cloud |
| **Actisense W2K** | Direct NMEA 2000 over Wi-Fi via an Actisense W2K-1 or W2K-2 gateway |
| **Yacht Devices YDWG** | Direct NMEA 2000 over Wi-Fi via a Yacht Devices YDWG-02 gateway |
| **Digital Yacht RAW** | Digital Yacht Wi-Fi NMEA 0183 gateways (WLN10/WLN30/NavLink2/LANLink); also Yacht Devices YDEN-02 |
| **NMEA 0183 over TCP/IP** | Any device streaming raw NMEA 0183 sentences over a TCP socket |
| **Multiple Connections** | Aggregate two or more of the above into one combined source |

You can have several connections configured at once (e.g., local SignalK at the dock and Victron VRM cloud when away). Pick the section below that matches your installation.

---

### SignalK

#### What it is

[SignalK](https://signalk.org) is an open marine-data standard. A SignalK server typically runs on a Raspberry Pi, NAS, or boat computer; it collects NMEA data from your instruments and makes it available over your local network. WilhelmSK connects to that server, subscribes to live data, and drives its gauges from the stream.

Two protocols are used together:

- **REST** — used at startup to discover the server's endpoints and fetch initial values.
- **WebSocket** — used for live streaming of instrument data (deltas). This is how gauges update in real time.

If you already have a SignalK server running on your boat and know its IP address or hostname, skip ahead to **Auto-discovery** or **Manual connection** below.

#### Running a SignalK server

If you don't have a SignalK server yet, common options on boats are:

**Raspberry Pi (most common)** — A dedicated Pi is the most popular choice. It draws very little power, handles the 24/7 server load easily, and can be wired directly to the boat's NMEA backbone. A Pi 3B+ or newer running Raspberry Pi OS is sufficient. The official installation instructions are at [https://github.com/SignalK/signalk-server](https://github.com/SignalK/signalk-server).

**NAS or existing boat computer** — If you already have a network-attached storage device or a Linux/Windows machine running continuously, SignalK can run there. Anything that can run Node.js works.

**Mac or PC on the same network** — A laptop or desktop on the boat's Wi-Fi is a valid option for testing or temporary use. You wouldn't normally leave a laptop running 24/7 at the nav station, but it's a convenient way to try the setup before committing to a Pi.

#### Auto-discovery (Bonjour)

If your SignalK server advertises itself via mDNS/Bonjour (which signalk-server-node does by default), WilhelmSK discovers it automatically. Open **Settings → Connections** and the server appears in the list within a few seconds. Tap it to connect — no manual entry required.

The app browses for four service types: `_signalk-http._tcp`, `_signalk-https._tcp`, `_signalk-ws._tcp`, and `_signalk-wss._tcp`. Discovering any one of these is enough. Vessel name, type, and MMSI are read from the server's TXT record and shown in the connection list.

Bonjour requires the phone/tablet to be on the same local network (same Wi-Fi or same VLAN) as the server. It does not work across VPN or different subnets without mDNS forwarding.

#### Manual connection

If Bonjour discovery isn't available — for example, when connecting over a VPN or to a server on a different subnet — tap **Add Connection → SignalK** and enter the server's host and port manually.

Fields to fill in:

- **Host** — IP address or hostname of the server (e.g., `192.168.1.100` or `raspberrypi.local`)
- **REST port** — typically `3000` for HTTP or `443` for HTTPS
- **WebSocket port** — typically the same as the REST port
- **SSL** — toggle on if your server uses HTTPS/WSS

The app fetches the server's `/signalk` endpoint on first connect and auto-fills the REST and WebSocket endpoint paths. You rarely need to edit those fields.

#### Authentication

WilhelmSK supports three authentication modes for SignalK:

**None** — the default. Works if your server doesn't require authentication (common on private boat networks).

**HTTP Basic** — enter a username and password. Credentials are sent with each request using standard HTTP Basic authentication. The app also handles server certificate trust challenges, so self-signed certs work if you accept the prompt.

**JWT token** — if your server requires login (via `/signalk/v1/auth/login`), enter a username and password and the app will log in automatically on each connection, storing and reusing the JWT token. The token is sent as `Authorization: JWT <token>` on all subsequent requests.

#### iCloud sync and favorites

Manual connections (ones you added by hand rather than discovered via Bonjour) are synced to iCloud. If you add a connection on your iPhone, it appears on your iPad automatically without re-entering the details.

Each connection can be marked as a **favorite**. Favorites appear at the top of the connections list, making it easy to jump to your most-used server when you have multiple connections configured.

---

### Victron Venus MQTT

Victron Energy's Venus OS (running on a Cerbo GX, Color Control GX, or compatible Raspberry Pi) exposes vessel electrical data — batteries, solar, inverters, shore power, tanks — via MQTT. WilhelmSK can connect directly to the local MQTT broker or through Victron's VRM cloud portal.

#### Local MQTT

**What it is:** A direct connection to the MQTT broker running on your Venus device on your local network.

**When to use it:** You're on the boat, connected to the same Wi-Fi as your Venus device. This gives the lowest latency and works without internet access.

**How to configure:** Tap **Add Connection → Venus MQTT (Local)**. Enter:
- **Host** — IP address or hostname of your Venus device (e.g., `192.168.1.50` or `cerbo.local`)
- **Port** — MQTT port, typically `1883`
- **Username / Password** — leave blank if your Venus device doesn't require authentication; otherwise use the credentials set in Venus OS

#### VRM Cloud (Victron Remote Monitoring)

**What it is:** A connection through Victron's hosted VRM portal (`mqtt.victronenergy.com`) to your Venus device, tunneled over the internet. Data is routed through Victron's MQTT brokers.

**When to use it:** You're away from the boat and want to check on your system remotely, or you want to monitor multiple vessels registered in your VRM account.

**How to configure:** Tap **Add Connection → Venus VRM**. Log in with your Victron VRM account credentials. The app fetches the list of portals (sites) registered to your account and lets you choose which one to connect to.

Under the hood the app connects to `mqtt<N>.victronenergy.com:8883` using TLS. It keeps the connection alive by publishing a keepalive message every 62 seconds. You don't configure any of that manually.

**Note:** VRM cloud connections require internet access on both the phone and the Venus device. If the Venus device loses its cellular or marina Wi-Fi connection, the VRM connection drops.

#### VRM Cloud — SignalK endpoint

If your Venus device runs the SignalK server package, you can reach its SignalK endpoint through the VRM cloud rather than over MQTT. Pick **Venus VRM Signal K** from the connection picker. Log in with VRM credentials the same way as the MQTT variant; the app handles the cloud-to-device routing.

Use this variant when you want the full SignalK feature set (custom paths, server plugins) tunneled through VRM. The plain VRM MQTT path is simpler if you only need standard Victron data.

#### Data format note

Venus/MQTT data is converted to SignalK deltas internally using a JavaScript bridge (`venus.js`). The gauges you configure work the same way regardless of whether the source is SignalK or Venus — the connection type is transparent once you're past setup.

---

### Actisense W2K

The **Actisense W2K-1** picker entry works with both the Actisense W2K-1 and the newer **W2K-2** NMEA 2000 Wi-Fi gateways. Both stream NMEA 2000 directly over a TCP server you configure on the device.

#### Setup

1. Power up the gateway. By default it creates its own Wi-Fi access point named `w2k-<serial>` (the serial is printed on the rear of the case, along with the Wi-Fi password). Connect your iOS device to that AP, or bring the W2K onto your boat's Wi-Fi via its admin UI.
2. Open the gateway's admin page at [http://192.168.4.1/](http://192.168.4.1/). Default login is `admin` with the password printed on the case.
3. In the admin UI's server/output configuration, enable a TCP server and note the port number — it's user-configurable and the gateway ships with no single default port.
4. In WilhelmSK, **Settings → Connections → +** and pick **Actisense W2K-1**. Enter the gateway's IP address and the TCP port you configured.

#### Vendor docs

- W2K-1: [actisense.com/products/w2k-1](https://actisense.com/products/w2k-1-nmea-2000-wifi-gateway/)
- W2K-2: [actisense.com/products/w2k-2](https://actisense.com/products/w2k-2-nmea-2000-wifi-gateway/)

---

### Yacht Devices YDWG

The **Yacht Devices YDWG-02** NMEA 2000 Wi-Fi gateway supports up to three configurable TCP/UDP servers. Server #1 ships pre-configured for NMEA 0183 on TCP port **1456**, which works as-is with WilhelmSK's YDWG picker entry.

#### Setup

1. Power up the gateway. Default Wi-Fi SSID and password are printed on the case. Connect your iOS device to that AP, or bridge the YDWG onto your boat's Wi-Fi via its admin UI.
2. Admin UI at [http://192.168.4.1/](http://192.168.4.1/) or [http://ydwg.local/](http://ydwg.local/) (mDNS supported). Default login `admin` / `admin`.
3. Server #1's defaults work out of the box. If you've reconfigured it, note the IP, port, and protocol in the gateway's status page.
4. In WilhelmSK, **Settings → Connections → +** and pick **YDWG**. Enter the gateway's IP and port `1456` (or whatever you've set Server #1 to).

#### Vendor docs

- [yachtd.com/products/wifi_gateway.html](https://www.yachtd.com/products/wifi_gateway.html)
- [YDWG-02 manual (PDF)](https://www.yachtd.com/downloads/ydwg02.pdf)

---

### Digital Yacht RAW

The **Digital Yacht RAW** picker entry accepts NMEA 0183 sentences ("RAW" 0183) over TCP. It's compatible with Digital Yacht's Wi-Fi and Ethernet NMEA gateway lineup, and also with the **Yacht Devices YDEN-02** Ethernet gateway when its Server #1 is set to NMEA 0183.

#### Compatible products

- **Digital Yacht:** WLN10 / WLN10SM, WLN30, NavLink2 (Wi-Fi); LANLink (Ethernet); iKonvert in Wi-Fi mode.
- **Yacht Devices:** YDEN-02 (Ethernet) with Server #1 configured for NMEA 0183.

#### Setup — Digital Yacht Wi-Fi gateways (WLN / NavLink)

1. Power up the gateway. It creates a Wi-Fi AP — `DY-WiFi-xxxx` (WLN30) or `NAVLink-xxxx` (NavLink2). Password is `PASS-xxxx` matching the 4-char SSID code. Join that AP from your iOS device, or bring the gateway onto your boat's Wi-Fi via its admin UI.
2. Admin UI at [http://192.168.1.1/](http://192.168.1.1/). No login required on first connection from the gateway's own AP.
3. Default TCP port is **2000** (UDP 2000 serves the same stream).
4. In WilhelmSK, **Settings → Connections → +** and pick **Digital Yacht RAW**. Enter the gateway's IP and port `2000`.

#### Setup — Yacht Devices YDEN-02

1. Power up the gateway. Admin UI at [http://192.168.4.1/](http://192.168.4.1/) or [http://yden.local/](http://yden.local/). Default login `admin` / `admin`.
2. In the admin UI, configure Server #1 with protocol **NMEA 0183** and note the TCP port (Yacht Devices convention is port `1456`; verify on the status page).
3. In WilhelmSK, pick **Digital Yacht RAW** and enter the YDEN's IP and the configured port.

#### Vendor docs

- Digital Yacht: [digitalyacht.support](https://digitalyacht.support/) — [WLN30](https://digitalyacht.support/product/wln30-smart-wireless-nmea-multiplexer/), [NavLink2](https://digitalyacht.support/product/navlink2/), [LANLink](https://digitalyachtamerica.com/product/lanlink/)
- Yacht Devices YDEN: [yachtd.com/products/ethernet_gateway.html](https://www.yachtd.com/products/ethernet_gateway.html)

---

### NMEA 0183 over TCP/IP

For any device that streams raw NMEA 0183 sentences over a TCP socket — multiplexers, AIS receivers, software bridges, custom gateways — use the **NMEA 0183** picker entry.

#### Setup

In WilhelmSK, **Settings → Connections → +** and pick **NMEA 0183**. Enter:

- **Host** — IP or hostname of the device producing the NMEA 0183 stream
- **Port** — the device's NMEA-over-TCP port. The IANA-registered default is **10110**, but many vendors override (Digital Yacht uses `2000`, Yacht Devices uses `1456` — for those, use the dedicated picker entries above)

The wire format is standard NMEA 0183: `$GPRMC,...*hh\r\n` lines. "RAW" in vendor parlance just means "unfiltered pass-through" — same wire format as plain NMEA 0183.

---

### Multiple Connections

If your boat has more than one data source — for example, a SignalK server for navigation data and a separate NMEA 2000 gateway for engine data — you can aggregate them into one combined connection. Each source feeds the same gauge layout.

In WilhelmSK, **Settings → Connections → +** and pick **Multiple Connections**. Add the individual connections (each already configured per the sections above), and the app merges their data streams.

---

### Remote Access

By default WilhelmSK connects over the local Wi-Fi on the boat. If you want to monitor your vessel from shore, a marina Wi-Fi, or a cellular connection, you need to make the SignalK server reachable from the internet. Two approaches are common.

#### Port Forwarding (Simple)

Forward a port on your boat's router to the SignalK server's local IP and port (typically 3000). On your router's admin page, add a TCP port-forward rule:

- **External port:** any unused port (e.g. 3001, or 443 for HTTPS)
- **Internal IP:** the SignalK server's local IP (e.g. 192.168.1.100)
- **Internal port:** 3000

In WilhelmSK, add a manual SignalK connection using your router's public IP address (or a dynamic-DNS hostname if your ISP gives you a changing IP) and the external port you chose. Enable SSL only if your server is configured for HTTPS.

Port forwarding is quick to set up but exposes your SignalK server directly to the internet on that port. At minimum, enable authentication on the server (Settings → Security in the SignalK admin panel) and use JWT or HTTP Basic auth in WilhelmSK.

#### Reverse Proxy with nginx (Recommended)

A reverse proxy sits in front of SignalK, handles HTTPS termination, and can add authentication before requests reach the server. This is more work to set up but gives you a clean `https://` URL, a valid TLS certificate (via Let's Encrypt), and optional Basic Auth as an additional layer.

A typical setup (as used with the pivac HVAC monitoring project):

1. Install nginx on the machine running SignalK (or a Pi on the same network).
2. Obtain a TLS certificate — Let's Encrypt via `certbot` is the standard free option.
3. Forward TCP ports 80 and 443 from your router to the nginx machine.
4. Configure an nginx `location` block for SignalK. The critical part is the proxy headers — without these, SignalK constructs its WebSocket URL using its local address instead of your external hostname, which breaks the WilhelmSK connection:

```nginx
location /signalk/ {
    proxy_pass http://localhost:3000/signalk/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

5. In the SignalK admin panel, go to **Server → Settings** and enable **"Trust Proxy"**. Without this, SignalK ignores the `X-Forwarded-Proto` header and still generates `ws://` WebSocket URLs, causing WilhelmSK to attempt an unencrypted connection on port 80 — which nginx immediately redirects (301), breaking the handshake.

6. In WilhelmSK, add a manual connection using your external hostname (`https://yourhostname.example.com`), port 443, with SSL enabled. The app will discover the server endpoints through the standard `/signalk` path and connect via WSS.

---

### Tips

**Multiple connections:** WilhelmSK supports configuring multiple connections. You can have a SignalK connection for use at the dock, a VRM cloud connection for remote monitoring, and a local Venus connection all saved in the list. Switch between them from the connections screen.

**Connection log:** If a connection fails, tap it in the list and look for a connection log option. The log shows each authentication and handshake step, which helps diagnose JWT login failures, certificate issues, or wrong-port problems.

**Watch and widget access:** Manual connections synced to iCloud are also available to the Apple Watch app and home screen widgets. The watch uses the same connection settings you configured on the iPhone.

**SSL and self-signed certificates:** If your server uses HTTPS with a self-signed certificate, the app will prompt you to trust it on first connection. Accept the prompt and the certificate is trusted for future sessions. Rejecting it will prevent connection.

---

## Not Just for Boats

WilhelmSK works with any SignalK data source, not only marine instruments. SignalK is a generic key-value protocol with a defined path namespace; anything that can push data to a SignalK server can be displayed in the app.

A concrete example is [pivac](https://github.com/dglc/pivac), a Raspberry Pi sensor collector for HVAC and home automation. pivac reads temperature sensors, relay states, thermostat data (via a Honeywell RedLink cloud API), hydronic pressure gauges, and power monitors, then pushes delta messages to a local SignalK server over WebSocket. WilhelmSK connects to the same server and displays all of that data using the same gauge system as a marine installation — water temperature gauges showing HVAC supply/return/outdoor temperatures, a switch bank showing relay states, and custom text gauges for thermostat setpoints.

If you have sensors or automation equipment that can push data to SignalK, WilhelmSK can display it. See [Custom SignalK Paths](#custom-signalk-paths) for how to configure gauges for non-marine SignalK paths.

---

## iOS and iPadOS

WilhelmSK on iPhone and iPad is the primary interface for configuring the app, managing layouts, and viewing live instrument data. This guide covers navigation, customization, widgets, and notifications.

---

### Navigation

#### The Sidebar

The sidebar is the app's main navigation panel. Swipe right from the left edge (or tap the hamburger menu) to open it. It contains three sections:

- **Gauges** — returns to the live gauge display
- **Settings** — connection, appearance, units, notifications, and advanced options
- **Log** — raw SignalK message log for debugging

Swipe left or tap anywhere on the main panel to close the sidebar.

#### Layouts and the Layout Selector

A *layout* is a named collection of pages. You might have a "Sailing" layout with wind and performance gauges, a "Motoring" layout with engine and fuel gauges, and an "At Anchor" layout with depth and battery. Switch between layouts in the sidebar's layout list.

Each layout is independent — its pages, gauge arrangement, and gauge configuration are stored separately. You can create as many layouts as you need.

---

### Pages and the Gauge Grid

Within a layout, data is organized into *pages*. Swipe left and right (iPhone/iPad portrait) or up and down (iPad landscape) to move between pages. Each page displays a configurable grid of gauges.

Pages use named templates that control how space is divided:

| Template | Description |
|---|---|
| Basic | Equal-size grid cells |
| LargeBottomView | One large gauge on top, smaller gauges below |
| LargeCenterGauge | Large gauge in the center with smaller gauges around it |
| MFD | Multi-function display style with many gauges |
| FullScreen | Single gauge fills the page |

---

### Interacting with Gauges in the Live View

#### Double-Tap: Fullscreen

Double-tap any gauge to expand it to fill the entire screen. The status bar hides for a cleaner view. Double-tap again to return to the normal page grid.

#### Long-Press: Gauge Settings and Type

Long-press any gauge (hold for about a second) to open a full gauge settings panel. From here you can:
- Change the **gauge type** (switch from, say, a wind dial to a depth gauge)
- Set the **SignalK path** the gauge reads
- Adjust **display options** — digital vs analog, title, units, decimal places
- Configure **alarm zones** — color thresholds that turn the gauge red/yellow when a value is out of range

On iPad, the settings panel opens as a split-view overlay. On iPhone, it pushes as a navigation stack.

Long-press is disabled when **Lock Gauges** is on (Settings → Lock Gauges). Enable the lock when underway to prevent accidental changes.

---

### Layout Manager and Editor

The Layout Manager is the screen that controls which pages appear in your layout and how they are structured. It has **three sections**, each with a distinct purpose:

**Your Pages** — the pages currently active in your layout, in the order they appear when you swipe left and right. Drag pages within this section to reorder them. Drag a page down into Custom Page Templates to save it as a reusable template.

**Builtin Page Templates** — read-only factory templates supplied by the app. You cannot edit these directly. Drag one up into Your Pages to add a copy to your layout. Drag one down into Custom Page Templates to create your own editable copy of it.

**Custom Page Templates** — your personal reusable templates. You can edit these freely, and you can drag them up into Your Pages to use them.

The final item in Your Pages and in Custom Page Templates is an **Add** placeholder. Tap it to create a new blank page or template.

---

#### Tapping a Page from "Your Pages" → Page Config Mode

When you tap a page from Your Pages, the editor opens in **page config mode**. This mode shows you the current page layout and lets you make gauge-level changes, but it does not let you restructure the slot layout (positions and sizes).

**What you see:** Save and Cancel buttons. An **Edit Template** or **Convert To Template** button.
**What you do not see:** Add (+), Delete (−), Width/Height fields, Add Grid, or Snap.

| Button | What it does |
|---|---|
| **Edit Template** | Opens the underlying layout template in template mode so you can add, remove, or reposition slots. Changes apply to all pages sharing that template. |
| **Convert To Template** | Shown for built-in templates instead of Edit Template. Creates a personal editable copy of the template and immediately opens it in template mode. |
| **Save** | Saves gauge-level changes for this page. |
| **Cancel** | Discards changes. |

Dragging is disabled entirely in page config mode — the editor does not move slots when you pan.

---

#### Tapping a Template from "Custom Page Templates" → Template Mode

When you tap a template from Custom Page Templates, the editor opens in **template mode** — the full structural editor. This is where you control how many gauge slots a template has, where they are, and how large they are.

**Controls:**

| Control | What it does |
|---|---|
| **+** (Add) | Adds a new gauge slot at the top-left, sized to match the selected slot if one is selected, otherwise 200×200. Drag it into position after adding. |
| **−** (Delete) | Removes the selected slot. If slots are grouped via multi-select, removes all of them. |
| **Add Grid** | Opens a grid tool with sliders for columns, rows, and cell size (as % of screen). The resulting grid appears as a movable group. |
| **Width / Height** | Exact pixel dimensions for the selected slot. Type and press Return. Updates live as you drag or pinch. |
| **Snap** | When on (default), slots snap within 10 pixels of adjacent slots and screen edges while dragging. |
| **Multi** | Multi-select mode. When on, tap additional slots to add them to a movable group; tap a grouped slot to remove it. Toggle off to commit positions. |
| **Share** | Saves the template, then offers: **Share...** (sends as `.wlyt` via AirDrop, Mail, Messages, or Files) or **Send to device...** (pushes to another WilhelmSK device on the same network via Bonjour). |
| **Save** | Saves all structural changes. |
| **Cancel** | Discards all changes. |

**Gestures in template mode:**

| Gesture | Effect |
|---|---|
| Tap | Selects a slot (red border). Tapping an already-selected slot cycles to the one underneath if slots overlap. |
| Drag from slot interior | Moves the slot. |
| Drag from bottom-right corner | Resizes the slot — the bottom-right corner is the resize handle. |
| Pinch | Resizes the slot from its center. |

---

#### Changing Which Gauge a Slot Displays

The layout editor controls positions and sizes only. To change which gauge type fills a slot — or to configure its SignalK path, display options, or alarm zones — long-press the gauge in the normal live view. See [Long-Press: Gauge Settings and Type](#long-press-gauge-settings-and-type).

### Editing Layout Files on Your Computer

WilhelmSK stores layouts as `.wlyt` files — plain JSON. For complex layouts, editing the JSON directly on a Mac is often faster than dragging gauges on a small screen.

**Getting the file off your device:**
1. Open the **Files** app on your iPhone or iPad.
2. Tap **On My iPhone** (or On My iPad) → **WilhelmSK**. Saved layout files appear here.
3. Long-press a `.wlyt` file and choose **Share → AirDrop** to send it to your Mac, or copy it to iCloud Drive for Finder access.

Alternatively, connect your device via USB, open Finder on the Mac, select your device, click **Files**, and drag the `.wlyt` file out.

**Editing:**
The format is JSON. Open it in any text editor. The top-level `layout` key contains a `pages` array; each page has a `pageLayout` (template name) and a `config` dictionary keyed by gauge slot index. The two fields you'll most often edit are the SignalK `path` and the `className` (gauge type). See [Custom SignalK Paths](#custom-signalk-paths) for path conventions.

**Putting it back:**
1. AirDrop the edited `.wlyt` back to your iPhone or iPad, or place it in a Files location you can access from the device.
2. Tap the file. iOS prompts you to open it with WilhelmSK.
3. WilhelmSK imports it and adds it to your layout list.

You can also share a layout directly from within the app — tap **Share** in the layout editor toolbar to send the current layout via AirDrop, Mail, Messages, or any available share target.

---

### Settings Reference

The Settings menu is reached from the sidebar. The following sections describe every option.

---

#### Connections

Covered in detail in [Connecting to a Data Source](#connecting-to-a-data-source).

---

#### Appearance

**Theme:**
- **Theme** — the active color palette. Tap to choose from built-in and custom themes.
- **Day** — the theme used for the light/day mode when Auto is selected.
- **Night** — the theme used for the dark/night mode when Auto is selected.
- **Force Dark Appearance** — forces the dark theme regardless of system appearance setting.
- **Apple** — segmented control: Light | Dark | Auto. Sets whether the app follows the iOS system appearance toggle.

**Display:**
- **Text Shadow** — adds a subtle drop shadow to gauge labels for readability over busy backgrounds.
- **Segmented Digital Font** — uses the app's built-in digital/7-segment font for digital readouts.
- **Digital Font** — shows the current digital font name; tap to open the font picker.
- **Title Display** — opens font settings for gauge titles (font face, size, color, position).
- **Units Display** — opens font settings for gauge unit labels.
- **Freshness** — where to show the data freshness indicator on each gauge: None, Top-Left, Top-Right, Bottom-Left, Bottom-Right, Top, or Bottom.
- **Analog Gauge Padding** — spacing (in points) between the gauge edge and the dial face for analog gauges.
- **Digital Gauge Padding** — spacing for digital readout gauges.
- **Border Width** — width of the border drawn around each gauge.
- **Border Rounding** — corner radius for gauge borders.
- **Border Color** — color picker for the gauge border color.

**Behavior:**
- **Keep Screen From Locking** — prevents the screen from dimming and locking while the app is in the foreground. Useful at the helm.
- **Lock Gauges** — disables long-press gauge editing so you can't accidentally reconfigure a gauge while underway.
- **Different Layouts for Portrait and Landscape** (iPad only) — when on, the app maintains separate page layouts for portrait and landscape orientations.
- **Don't Throttle Display** — disables the frame rate throttling that the app applies when running on battery. May increase battery drain.
- **Only When Plugged In** — available when Don't Throttle is on; only disables throttling when the device is charging.

**Map and Track:**
- **Use Device Location/Heading** — segmented: Never | Always | Not In Signal K | Not At Boat. Controls whether the iOS device's GPS/compass is used for your vessel position and heading, or whether the app uses Signal K data only.
- **Use Device Attitude** (pitch/roll) — segmented: Never | Always | If Not In Signal K. Whether to use the device's accelerometer for pitch and roll gauges.
- **Show Track** — displays a track line of past positions on map gauges (requires the `signalk-to-influxdb` plugin and a compatible server). When enabled: **Timespan** (how far back to show, e.g. `1h`) and **Resolution** (sampling interval, e.g. `1m`).
- **Track Color** — color picker for the position track line.
- **Show Course Vector** — draws a line ahead of your vessel showing current course over ground. Color is configurable.
- **Show AWA Vector** — draws the apparent wind angle vector. Color is configurable.
- **Show TWA Vector** — draws the true wind angle vector. Color is configurable.
- **Show Route** — displays the active navigation route on map gauges. Color is configurable.
- **Show Notes** — shows ActiveCaptain community notes on map gauges.

**Map Objects:**
- **My Ship Size** — slider controlling the size of your vessel icon on map gauges.
- **My Ship Transparency** — slider (0–100%) for vessel icon transparency.
- **AIS Target Size** — slider for AIS target icons.
- **AIS Transparency** — slider for AIS icon transparency.
- **POI Size** — slider for point-of-interest markers (ActiveCaptain, Navionics).
- **POI Transparency** — slider for POI marker transparency.

**Navionics (if Navionics SDK is active):**
- **Mode** — chart rendering mode (standard, fishing, satellite overlay, etc.).
- **Contour Density** — density of depth contour lines.
- **Easy View** — high-contrast chart rendering for bright sunlight.
- **Shallow Area** — slider setting the depth threshold below which areas are highlighted as shallow.
- **Depth Shading** — slider controlling depth shading intensity.
- **Depth Contours** — slider controlling contour line density (or "ALL" for all contours).

**ActiveCaptain:**
- **Show On Maps** — shows ActiveCaptain marina, anchorage, and hazard markers on map gauges.
- **Download Over Wi-Fi Only** — prevents downloading ActiveCaptain data over cellular.
- **Disable Updates** — stops the app from downloading updated ActiveCaptain data.
- **Login / Logout** — authenticate with your Garmin/ActiveCaptain account for full access.
- **Force Update** — manually triggers a data download.
- **Delete Data** — removes cached ActiveCaptain data from the device.
- Status fields show the last update date and your ActiveCaptain captain name and points.

---

#### Themes

Opens the theme list. The app ships with built-in themes (Dark, Light, and variants). Tap a theme to apply it. A theme editor lets you create custom themes by adjusting background, text, and accent colors and saving them under a name.

---

#### Layouts

Opens the Layout Manager where you manage your layouts and pages. See [Layout Manager and Editor](#layout-manager-and-editor) for full detail.

---

#### Old Layouts

Provides access to layouts created in an older format. If you have layouts from a previous version of the app, they appear here and can be migrated to the current format.

---

#### Notifications

- **Enable Signal K Alarms** — shows in-app alert banners for `vessels.self.notifications.*` paths received over the active connection. No server plugin required. This is the primary alarm display mechanism.
- **Enable Local Push** — enables push notifications delivered via the WilhelmSK local push provider (requires the push provider server plugin). Notifications arrive even when the app is in the background.
- **Enable Remote Push** — enables APNs remote push notifications (for cloud-relay scenarios; requires additional server-side configuration).
- **Use V2 Notifications API** — uses the Signal K v2 notifications API if the server supports it, instead of the v1 `notifications.*` delta path.
- **Device Token** — read-only indicator showing whether the app has successfully registered an APNs device token (displays "Has Device Token" or "No Device Token").

---

#### Anchor

Opens the anchor alarm control screen. See [Anchor Alarm](#anchor-alarm) in the Alarms section for full detail.

The settings screen also provides:
- **Mode** — Automatic (the app calculates the anchor position from current GPS position when you tap Drop) or Manual (you enter latitude/longitude directly).
- **Drop Anchor** — records the current position as the anchor location and activates monitoring.
- **Set Radius** — sets the alarm radius (in your configured distance unit).
- **Raise Anchor** — clears the anchor position and deactivates monitoring.
- **Rode Length** — the amount of anchor chain/rope deployed (used by the server plugin to refine the alarm radius).
- **Anchor Depth** — the water depth at the anchor location.
- An embedded map shows the anchor position and current vessel position relative to the alarm radius.

---

#### Units

Sets the display unit for each measurement category. Changes apply globally to all gauges.

| Category | Options |
|---|---|
| Long Distance | Nautical miles, Statute miles, Kilometers |
| Short Distance | Feet, Meters |
| Wind Speed | Knots, mph, km/h, m/s |
| Speed | Knots, mph, km/h |
| Depth | Feet, Meters, Fathoms |
| Fuel / Volume | Gallons, Liters |
| Temperature | Fahrenheit, Celsius |
| Engine Pressure | PSI, Bar, kPa |
| Atmospheric Pressure | inHg, hPa, mbar |
| Position | Degrees/Minutes/Seconds, Decimal Degrees |
| Rate of Turn | Degrees/min, Degrees/sec |
| Flow Rate | Gallons/hour, Liters/hour |
| Fuel Economy | mpg, L/100km |
| Energy | kWh, Joules |

---

#### Today / Widget Editor

Opens the widget editor for the iOS Today widget (legacy) and for configuring which gauges appear in WidgetKit home screen widgets. Drag gauges to reorder them, or tap a gauge entry to choose a different gauge type or SignalK path.

---

#### Share Settings

Exports your current app settings — connections, layout names, unit preferences, and appearance settings — as a `.wsettings` file shared via the system share sheet (AirDrop, Mail, Files, etc.). Recipients can import the file by opening it with WilhelmSK. Useful for transferring your configuration to a new device or sharing with a crew member.

---

#### Watch Layout *(shown when Apple Watch is paired)*

Opens the watch gauge editor. The screen shows a list of gauges configured for the Apple Watch. Drag to reorder. Tap a gauge to change its type or SignalK path. Changes sync to the watch the next time a WCSession connection is established.

---

#### Server Plugins *(shown when server supports plugins)*

Displays a list of SignalK server plugins installed on the connected server. Tap a plugin to view and edit its configuration — boolean toggles, text fields, number fields, and enum selectors, depending on the plugin's settings schema. Changes are sent to the server immediately.

---

#### Cloud / Vessel Selector *(shown when multiple vessels are detected)*

Displays a list of vessels currently visible on the Signal K network (other vessels broadcasting AIS or connected to the same server). Tap a vessel to switch the app's viewing context to that vessel — all gauges will then display that vessel's data instead of your own. The selected vessel is highlighted. Tap your own vessel to return to the default `vessels.self` context.

---

#### Shutdown Server *(shown when `signalk-server-shutdown` plugin is installed)*

Sends a shutdown command to the Signal K server after a confirmation alert. Use with caution — the server will stop running and you will lose all data until it restarts.

---

### Sidebar: Additional Items

Beyond the Settings menu, the sidebar contains:

**Playback** *(shown when `signalk-to-influxdb` plugin is detected)* — switches the app into playback mode, replaying historical instrument data from the InfluxDB database. A playback control bar appears at the top of the screen. Tap Gauges or any other sidebar item to exit playback mode.

**AR View** *(shown on supported devices)* — opens an augmented reality overlay that displays instrument data overlaid on the device camera view.

---

### iPad-Specific Features

#### Split View and Slide Over

WilhelmSK runs in Split View and Slide Over alongside other apps. When the app is in a compact window (Slide Over or a narrow Split View column), it automatically switches to a single-column layout optimized for the reduced space. Full-size layouts are restored when the window expands.

#### External Display

On iPads with Stage Manager enabled, you can move the WilhelmSK window to an external monitor or connected display. The app resizes to fill the available window.

#### Orientation

The iPad layout adapts to both portrait and landscape. Gauge grids reflow when orientation changes so content remains visible without manual adjustment.

---

### WidgetKit Widgets

WilhelmSK provides home screen and lock screen widgets so you can glance at instrument data without opening the app. Widgets read from the app's shared data store, which the app updates while it's running.

#### Available Widgets

| Widget | What it shows |
|---|---|
| Gauge | A single analog or digital gauge (speed, depth, heading, etc.) |
| Battery | Battery voltage and charge state |
| Generic Gauge | Any SignalK path you configure |
| Switch | State of a switch or relay |
| Multi-Switch | State of multiple switches |

On iOS 18 and later, WilhelmSK also provides **Controls** that appear in Control Center:

- Anchor drop / raise / lock radius
- Autopilot tack and heading
- Switch and multi-switch toggles
- Stereo control

#### Adding Widgets

Long-press the home screen to enter jiggle mode, then tap **+** and search for "Wilhelm". Choose a widget and size, then tap **Add Widget**. Tap the widget to configure which gauge or path it displays.

#### Update Frequency

Widgets update on a schedule (approximately every minute while the app is in the foreground and has fresh data). iOS may throttle updates based on battery level and usage patterns, so a widget reading may be up to a few minutes behind the live app display. Widgets are not a substitute for the live gauge view during active navigation — open the app for real-time data.

Controls (iOS 18+) respond immediately when tapped because they send a command directly to the app's shared data, not through a widget timeline.

---

### Push Notifications

WilhelmSK can receive push notifications for SignalK alarm conditions — anchor drag, depth threshold, battery low, custom path alarms, and any `vessels.self.notifications.*` path published by your server.

#### How It Works

The app connects to a *UPN (Universal Push Notifications)* provider — a lightweight server process running alongside your SignalK server. When the server raises an alarm notification, the UPN provider forwards it to your device via Apple Push Notification service (APNs), so you receive the alert even when the app is in the background or your device is asleep.

#### Server Plugin Required

Push notifications require the **WilhelmSK UPN server** plugin installed on your SignalK server. See [Server Plugins](#server-plugins) for the full dependency table and setup link.

#### Setup Steps

1. Install the UPN server plugin on your SignalK server.
2. In WilhelmSK, go to **Settings → Notifications**.
3. Enable **Local Push Notifications** and enter the UPN server's host address and port.
4. Grant notification permission when iOS prompts you.

The app registers your device token with the UPN server automatically. If the connection drops, the app retries with exponential backoff (10 seconds, then 5 minutes, then 25 minutes).

#### Notification Settings

In **Settings → Notifications** you can independently enable or disable:

- **SignalK Alarms** — in-app alert banners for `notifications.*` paths (no server plugin required)
- **Local Push** — UPN server push (requires plugin, works when app is backgrounded)
- **Remote Push** — APNs remote notifications (for future cloud-relay support)

#### What Triggers a Notification

Any SignalK `vessels.self.notifications.*` path can produce an alert. Common triggers:

- Anchor alarm (`notifications.navigation.anchor`)
- Depth alarm (`notifications.environment.depth.*`)
- Server-configured threshold alarms on any path
- Custom alarms from server-side plugins

The alarm indicator in the app's top bar lights up for any active unacknowledged alarm. Open the alarm panel to acknowledge or silence individual alarms.

---

## watchOS

WilhelmSK includes a native Apple Watch app for glancing at instrument data from your wrist. It shows the same gauge types as the iPhone — wind, speed, depth, battery, switches, autopilot — but on a compact watch face.

---

### Requirements

- Apple Watch paired to an iPhone running WilhelmSK
- watchOS 9 or later (the SwiftUI watch app)
- The iPhone must be awake and within Bluetooth or Wi-Fi range when the watch app starts or needs to refresh data

The watch app communicates with the iPhone via Watch Connectivity (WCSession). It does not have its own independent network connection to the SignalK server — all data flows through the phone.

---

### Initial Setup

Install the watch app from the Watch app on iPhone (look for WilhelmSK in the Available Apps section). Once installed, the watch app opens and sends a request to the phone for the current connection and gauge configuration.

**The phone must be awake and reachable when the watch app first launches.** If the phone is asleep or out of range, the watch displays a spinner and waits. Once the phone responds, the gauge layout is pushed to the watch and data starts flowing.

If you see the message "Please configure gauges in WilhelmSK Settings → Watch Layout", the phone has not sent a gauge configuration yet. Open WilhelmSK on the iPhone and set up the Watch Layout (see below).

---

### Configuring Watch Gauges

Watch gauges are configured from the **iPhone**, not from the watch itself.

In WilhelmSK on iPhone, go to **Settings → Watch Layout**. The Watch Layout screen has three sections:

| Section | Behavior |
|---------|----------|
| Normal | The default set of gauges shown when you open the watch app |
| Swipe Up | The gauge set shown when you swipe up on the watch face |
| Swipe Down | The gauge set shown when you swipe down on the watch face |

Tap any section to add or remove gauges. Once you save, the phone pushes the new configuration to the watch automatically.

---

### Available Gauge Types

The watch supports a subset of gauge types — those that fit on a small display and update meaningfully at the watch's refresh rate:

| Gauge | Description |
|-------|-------------|
| Graphic Gauge | A single value with digital, circle, or analog display style |
| Watch Grid | Up to 6 small readings on one screen (good for a combined overview) |
| Switch Gauge | On/off state of a single switch or relay |
| Switch Bank | State of a group of switches |
| Multi-Switch | Multiple switches with toggle controls |
| Anchor Gauge | Current anchor position and radius |
| Anchor Alarm Control | Drop, raise, and lock-radius controls |
| Electrical Overview | Battery bank summary |
| Autopilot Control | Engage/disengage and heading adjust |

---

### Update Rate

The watch polls for new data on a **~2-second interval** (configurable from iPhone settings). Each tick the watch app requests fresh values from the phone, which in turn pulls from the active connection.

The watch face includes a **freshness indicator** — a small animated circle that changes color as data ages. If the indicator stops animating, the phone is no longer sending updates (it may be asleep, out of range, or the connection dropped).

When you background the watch app or lower your wrist, the polling timer pauses. It resumes when you raise your wrist and the app returns to the foreground.

---

### Complications and Widgets

The watch app supports WidgetKit-based watch complications for the watch face. These display a single gauge reading in a corner, inline, or modular complication slot.

Complications update on the **WidgetKit schedule** (~15 minutes), not at the 2-second live rate. They are useful for a persistent glance at a slowly-changing value (battery charge, tank level) rather than live navigation data.

To add a complication: long-press your watch face → Edit → tap a complication slot → scroll to WilhelmSK → choose which gauge to show.

---

### Known Quirks

**Watch goes blank if phone is out of range.** If you move beyond Bluetooth range and the phone is not on the same Wi-Fi network, the watch stops receiving updates. The freshness indicator will change color. Data from before the connection dropped remains visible but frozen.

**Phone must be awake for the first sync.** The WCSession-based configuration push requires the phone to be active. If you open the watch app and the phone is asleep, the gauge layout may not load until the phone wakes.

**Non-SignalK connections always require the phone.** The watch app routes all non-SignalK data (Victron MQTT, Actisense W2K, Yacht Devices YDWG, Digital Yacht RAW, generic NMEA 0183) through the phone — it cannot speak those protocols directly. The phone must be reachable for these connections to work on the watch.

**SignalK connections also route through the phone.** The watch uses the auth token and connection details obtained from the phone. If the phone is unreachable, the watch cannot fetch data from the server even if both are on the same Wi-Fi network.

---

## Gauges

WilhelmSK organizes its display into layouts, pages, and gauges — each layer letting you customize what data you see and how.

### Concepts

**Gauge** — a single instrument panel: a wind dial, a depth readout, a tank indicator, a map. Each gauge subscribes to one or more SignalK paths and updates in real time.

**Page** — a screen that holds a grid of gauges. You swipe between pages. Each page has a layout that controls how many gauges fit (1 large, 2 side-by-side, a 2×2 grid, etc.).

**Layout** — a named collection of pages. You might have a "Sailing" layout with wind-heavy pages and a "Motoring" layout showing engine gauges. Switch layouts from the sidebar.

### Adding and Removing Gauges

To change the structure of a page (add or remove slots, resize, reposition):

1. Open the Page Manager and navigate to your layout templates.
2. Tap a custom template to open it in template mode. If you only have pages (not templates), open a page and tap **Convert To Template** to create an editable copy.
3. Use the **+** button to add a slot, **−** to remove the selected slot, or **Add Grid** to insert a grid of slots at once.
4. Drag slots into position; drag from the bottom-right corner or pinch to resize.
5. Tap **Save**.

See the [Layout Manager and Editor](#layout-manager-and-editor) section for a full control reference.

### Changing a Gauge Type

Long-press any gauge in the normal live view (not the editor) to open its full settings panel. From there you can change the gauge type, the SignalK path, display options, and alarm zones. This is the primary way to configure what any given slot displays — the layout editor controls position and size only.

### Full-Screen Mode

Double-tap any gauge to expand it to fill the page. Double-tap again (or tap Back) to return to the normal grid. Full-screen is useful for analog wind dials or charts where detail matters.

### Display Modes

Many gauges offer both analog and digital display modes. Open a gauge's options (tap the gear icon in edit mode) to switch. Some gauges — particularly wind — also let you choose what reference (apparent vs. true vs. ground) to display.

### The Generic Gauge (Any SignalK Path)

The **Text** gauge (also listed as `TextGaugeConfig`) displays any numeric or string value from any SignalK path. Use it for custom sensor data, non-standard NMEA paths, or any value the app doesn't have a dedicated gauge for.

To configure it:
1. Add a Text gauge to a page.
2. Tap its settings (gear icon in edit mode).
3. Enter the full SignalK path (e.g., `environment.inside.thermostat.KIDS_ROOM.temperature`).
4. Set the number format (e.g., `%0.1f` for one decimal place) and a label.

See [Custom SignalK Paths](#custom-signalk-paths) for a worked example using non-marine data.

---

### Gauge Reference

The tables below list all gauge categories and types with their primary SignalK paths. Paths marked with `*` are instance wildcards — configure the specific instance (e.g., `propulsion.0` or `propulsion.port`) in the gauge settings.

#### Wind

| Gauge | SignalK Path(s) |
|-------|----------------|
| AWA (Apparent Wind Angle) | `environment.wind.angleApparent` |
| AWA (Course Over Ground) | `environment.wind.angleTrueGround` |
| AWA (True Wind Angle) | `environment.wind.angleTrueWater` |
| AWA (Ground Wind Angle) | `environment.wind.angleGround` |
| AWS (Apparent Wind Speed) | `environment.wind.speedApparent` |
| TWA (True Wind Angle) | `environment.wind.angleTrueWater` |
| TWS (True Wind Speed) | `environment.wind.speedTrue` |
| TWD (True Wind Direction) | `environment.wind.directionTrue` |
| GWA (Ground Wind Angle) | `environment.wind.angleGround` |
| GWS (Ground Wind Speed) | `environment.wind.speedOverGround` |
| GWD (Ground Wind Direction) | `environment.wind.directionGround` |
| TWA or GWA | `environment.wind.angleTrueWater` / `angleGround` |
| Drift | `environment.current.drift` |
| Set | `environment.current.setTrue` |

#### Navigation

| Gauge | SignalK Path(s) |
|-------|----------------|
| SOG (Speed Over Ground) | `navigation.speedOverGround` |
| COG (Course Over Ground) | `navigation.courseOverGroundTrue` |
| Speed (Through Water) | `navigation.speedThroughWater` |
| Heading (True) | `navigation.headingTrue` |
| Heading (Magnetic) | `navigation.headingMagnetic` |
| Head Wind (COG) | `navigation.courseOverGroundTrue` + wind |
| Head Wind (Mag COG) | `navigation.headingMagnetic` + wind |
| Position | `navigation.position` |
| XTE (Cross-Track Error) | `navigation.courseRhumbline.crossTrackError` |
| DTW (Distance to Waypoint) | `navigation.courseRhumbline.nextPoint.distance` |
| TTW (Time to Waypoint) | derived from DTW + SOG |
| ETA | `navigation.destination.eta` |
| Rate of Turn | `navigation.rateOfTurn` |
| Pitch | `navigation.pitch` |
| Roll | `navigation.roll` |
| Yaw | `navigation.yaw` |
| Date/Time | `navigation.datetime` |

#### Depth & Environment

| Gauge | SignalK Path(s) |
|-------|----------------|
| Depth | `environment.depth.belowSurface` (falls back to `belowTransducer` + `surfaceToTransducer`) |
| Water Temperature | `environment.water.temperature` |
| Atmospheric Pressure | `environment.outside.pressure` |
| Air Temperature | `environment.outside.temperature` |
| Tide | tide/current data |

#### Engine & Propulsion

| Gauge | SignalK Path(s) |
|-------|----------------|
| RPM | `propulsion.*.revolutions` |
| Coolant Temperature | `propulsion.*.temperature` |
| Oil Pressure | `propulsion.*.oilPressure` |
| Oil Temperature | `propulsion.*.oilTemperature` |
| Alternator Voltage | `propulsion.*.alternatorVoltage` |
| Engine Runtime | `propulsion.*.runTime` |
| Fuel Rate | `propulsion.*.fuelRate` |
| Engine Load | `propulsion.*.engineLoad` |
| Engine Torque | `propulsion.*.engineTorque` |
| Fuel Economy | derived from fuel rate + speed |

`*` is a placeholder for the engine instance — configure `0`, `port`, `starboard`, or another instance in gauge settings.

#### Tanks

| Gauge | SignalK Path(s) |
|-------|----------------|
| Fuel | `tanks.fuel.*.currentLevel` |
| Fresh Water | `tanks.freshWater.*.currentLevel` |
| Black Water | `tanks.blackWater.*.currentLevel` |
| Waste Water | `tanks.wasteWater.*.currentLevel` |

Both percentage and volume (liters/gallons) display modes are available. Configure the tank instance number in gauge settings.

#### Electrical

| Gauge | SignalK Path(s) |
|-------|----------------|
| Battery Voltage (1) | `electrical.batteries.1.voltage` |
| Battery Voltage (2) | `electrical.batteries.2.voltage` |
| Battery Voltage (24V) | `electrical.batteries.*.voltage` |
| Amps | `electrical.batteries.*.current` |
| Watts | `electrical.batteries.*.power` |
| State of Charge | `electrical.batteries.*.capacity.stateOfCharge` |
| Joules | `electrical.batteries.*.capacity.stateOfCharge` (energy) |
| Charge Mode | `electrical.batteries.*.chargeState` |
| Battery Overview | multi-path summary |
| Electrical Overview | multi-path summary |

#### Switches and Relays

| Gauge | Notes |
|-------|-------|
| SwitchBank | Displays a bank of on/off switches; paths from `electrical.switches.*` |
| SwitchGauge | Single switch/relay indicator |
| SwitchLED | LED-style indicator for a switch state |
| LEDGauge | Single LED indicator |
| LEDBank | Bank of LED indicators |
| MultiSwitch | Grid of toggle switches for relay control |
| Slider | Dimmer/level slider for compatible devices |

Switch paths follow `electrical.switches.{bank}.{switch}.state`.

#### Autopilot

| Gauge | Notes |
|-------|-------|
| AutoPilotControl | Full autopilot control panel — requires the [Raymarine autopilot server plugin](#server-plugins) |
| RudderAngle | `steering.rudderAngle` |

#### AIS

| Gauge | Notes |
|-------|-------|
| AIS Targets | Overlay of AIS vessel positions — requires AIS data in SignalK (`vessels.*`) |
| AIS Targets Table | Tabular list of nearby vessels with CPA/TCPA |

#### Maps and Charts

| Gauge | Notes |
|-------|-------|
| Map (Apple Maps) | Vessel position on Apple Maps |
| Google Map | Vessel position on Google Maps |
| Navionics | Marine chart overlay — requires Navionics subscription |
| Freeboard-SK | Embedded Freeboard-SK web chart — requires server-side Freeboard-SK |

#### Camera

| Gauge | Notes |
|-------|-------|
| IP Camera | RTSP/IP camera stream — enter the camera URL in gauge settings |

#### Fusion Stereo

| Gauge | Notes |
|-------|-------|
| Fusion | Stereo playback controls — requires the [Fusion server plugin](#server-plugins) |

#### Utility

| Gauge | Notes |
|-------|-------|
| Text | Generic gauge for any SignalK path — numeric or string |
| Ratio | Displays a ratio derived from two paths |
| Percent | Percentage display for any 0–1 value path |
| Volume | Volume display |
| Image | Static image tile |
| Label | Static text label |
| Web | Embedded web view (enter a URL) |
| Empty | Placeholder / blank slot |
| GaugeStack | Stacks two gauges vertically in one slot |
| Scrollable | Scrollable list of values |
| Time HHMM | Clock display |
| Thermostat | Thermostat control (for compatible HVAC systems) |
| AnchorAlarmControl | Anchor alarm drop/raise and radius control |
| Anchor | Anchor position and drag distance |
| Tide | Tide height and prediction |
| MultiGauge | Composite gauge combining multiple readings |

---

## Alarms and Notifications

WilhelmSK surfaces two kinds of alarms: **server-side notifications** raised by the SignalK server (or its plugins) and delivered to the app over the live data stream, and **local zone alarms** configured per gauge on the device. The anchor alarm is a special case that bridges both: the app sends a drop-anchor command to a server plugin, and the plugin raises a SignalK notification when the vessel drifts.

---

### The Alarm Indicator

The alarm button in the top bar gives you a persistent status summary:

- **Red** — one or more unacknowledged alarms at `alarm` or `emergency` severity are active.
- **Yellow** — one or more unacknowledged warnings at `warn` or `alert` severity are active.
- **Gray / dimmed** — no active alarms, or all notifications have been acknowledged.

When alarms are active, a scrolling marquee next to the button shows the vessel name and the notification message. If multiple alarms are active, it cycles through them every four seconds. The background color of the marquee matches the severity: yellow for warnings, red for alarms.

Tapping the alarm button opens the **Alerts list**, which shows every active notification with its path, message, and timestamp. From there you can act on each alarm individually.

---

### Server-Side Alarms

SignalK represents alarms and notifications as values under the `notifications.*` path hierarchy. Any value published there — by the server itself, by an instrument, or by a plugin — appears in WilhelmSK as a notification.

#### Severity levels

| State | Meaning | Indicator color |
|-------|---------|----------------|
| `normal` | Condition resolved | None |
| `alert` | Advisory — attention needed | Yellow |
| `warn` / `warning` | Warning — action may be needed | Yellow |
| `alarm` | Alarm — action required | Red |
| `emergency` | Critical — immediate action required | Red |

#### Responding to a notification

In the Alerts list, each notification offers up to three actions depending on what the server allows:

- **Silence** — suppresses audio for this notification without acknowledging it. On servers that support the SignalK v2 notifications API, the silence is sent back to the server (`POST /notifications/{id}/silence`). On v1 servers, the method list is cleared locally.
- **Acknowledge** — marks the notification as seen. On v2 servers this is confirmed server-side (`POST /notifications/{id}/acknowledge`). Acknowledged notifications no longer count toward the alarm indicator.
- **Clear** — removes the notification entirely. On v2 servers this sends `DELETE /notifications/{id}`; on v1 servers the state is set to `normal`.

Which actions appear depends on the notification's `canSilence`, `canAcknowledge`, and `canClear` flags sent by the server.

#### Security access requests

If the SignalK server is configured with access control, connection requests from new clients appear in the Alerts list as `notifications.security.accessRequest.*` notifications. You can approve or deny them directly from the app.

---

### Local Zone Alarms

Each gauge in WilhelmSK can have **zones** — value ranges that map to a severity state. Zones are stored as SignalK metadata (`path.meta.zones`) and are applied whenever the gauge value falls within the configured range.

#### What zones do

When a value enters a zone, the gauge changes color to reflect the severity (green for normal, yellow for warn/alert, red for alarm/emergency). If the zone's `method` includes `sound`, the app also plays an alert tone.

#### Configuring zones

1. Long-press a gauge to open the gauge editor.
2. Navigate to the **Zones** section.
3. Tap the **+** button to add a zone, or tap an existing zone to edit it.

Each zone has:
- **State** — the severity level (`normal`, `alert`, `warn`, `alarm`, `emergency`).
- **Lower / Upper** — the value range (in the gauge's configured units). The zone matches when `lower ≤ value < upper`.
- **Message** — the text shown in the alarm indicator when this zone is active.
- **Label** — a short label for the zone (e.g., "Low Voltage", "Overheat").
- **Visual / Sound** — whether the zone triggers a color change, an audio alert, or both.

Zones you configure in the app are stored locally and applied on top of any metadata the server provides.

---

### Anchor Alarm

The anchor alarm lets you drop a virtual anchor and receive an alert if the vessel drifts beyond a set radius.

> **Requires the server plugin:** The anchor alarm depends on the `@signalk/signalk-anchoralarm-plugin` running on your SignalK server. Without it, the drop/raise commands have no effect.

#### Setting the anchor

1. Open the **Anchor Alarm** panel (available as a gauge type, or from the top bar anchor button if shown).
2. Set the **alarm radius** in meters — the maximum distance the vessel is allowed to drift from the drop point.
3. Tap **Drop Anchor**. The app sends the current GPS position and radius to the server plugin, which begins monitoring.

The anchor button in the top bar changes color to confirm:
- **Green** — anchor is down with a valid radius set.
- **Yellow** — anchor is down but no radius has been configured.
- **Text color** — no anchor is currently dropped.

#### When the alarm fires

If the vessel drifts beyond the configured radius, the server plugin raises a `notifications.anchoralarm.*` notification. This appears in the alarm indicator (red) and the marquee text, and triggers a local alert on the device.

#### Raising the anchor

Tap **Raise Anchor** in the anchor panel. This sends a raise command to the plugin, which clears the anchor position and stops monitoring.

---

### Push Notifications

Push notifications let the app alert you even when it is in the background or the device screen is off.

> **Requires a server plugin.** Remote push notifications require the WilhelmSK push plugin running on your SignalK server. See [Server Plugins](#server-plugins) for setup instructions and the plugin repository link.

#### How it works

WilhelmSK includes a **Local Push Provider** (a Network Extension) that maintains a persistent TCP connection to the SignalK server. When a notification arrives on that connection, the provider delivers it as a local iOS/iPadOS notification — even if the main app is suspended.

For remote push (when the device is off the same network as the server), the server plugin routes notifications through AWS SNS using the device token registered by the app at launch.

#### Enabling push notifications

1. Go to **Settings → Notifications** in the app.
2. Enable **SignalK Alarms** (master toggle for all server notifications — on by default).
3. Enable **Local Push** to receive notifications when the app is backgrounded on the same network.
4. Enable **Remote Push** to receive notifications away from the boat network (requires the server-side push plugin).

If local push notifications are not being delivered, check that iOS has granted the app notification permission (**Settings → WilhelmSK → Notifications**).

#### Reconnection behavior

The local push provider uses exponential backoff if the server connection drops: it retries after 10 seconds, then 60 seconds, then every 5 minutes. Notifications sent while disconnected are not replayed.

---

## Server Plugins

Several advanced WilhelmSK features require companion plugins running on your SignalK server. This page lists every optional dependency, what it unlocks, and where to find it.

> **Base requirement:** All plugins listed here run on [signalk-server-node](https://github.com/SignalK/signalk-server-node). See the [canonical setup guide](https://github.com/sbender9/wilhelmsk-node-server-setup) for installing signalk-server-node and adding plugins.

---

### Plugin dependency matrix

| Feature | Plugin name | Plugin repo | Notes |
|---------|-------------|-------------|-------|
| Server-side alarms | `signalk-zones` | [sbender9/signalk-zones](https://github.com/sbender9/signalk-zones) | Publishes threshold alerts to `notifications.*`; WilhelmSK reads and displays them |
| Push notifications | `signalk-push-notifications` | [sbender9/signalk-push-notifications](https://github.com/sbender9/signalk-push-notifications) | Local push via persistent TCP; remote push via AWS SNS when off-network |
| Anchor alarm | `signalk-anchoralarm-plugin` | [sbender9/signalk-anchoralarm-plugin](https://github.com/sbender9/signalk-anchoralarm-plugin) | Monitors vessel position and raises `notifications.anchoralarm.*` on drift |
| Raymarine autopilot control | `signalk-raymarine-autopilot` | [sbender9/signalk-raymarine-autopilot](https://github.com/sbender9/signalk-raymarine-autopilot) | Enables the autopilot control panel: mode, heading/wind target, tack/gybe |
| Fusion stereo control | *(none required)* | — | WilhelmSK sends commands directly via NMEA 2000 paths; no plugin needed |
| AIS targets | *(none required)* | — | AIS data flows through SignalK natively as `vessels.*`; no plugin needed |
| Navionics track overlay | *(none required)* | — | WilhelmSK reads the vessel's own track from `vessels.self.track`; no plugin needed |
| Freeboard-SK integration | *(none required)* | — | WilhelmSK can link to a Freeboard-SK instance on the same server; no server-side plugin needed |

---

### Feature details

#### Server-side alarms (`signalk-zones`)

SignalK zone alarms let the server watch any data path and emit a notification when a value crosses a threshold. WilhelmSK monitors `notifications.*` and surfaces active alarms in the alarm indicator at the top of the screen. The zones plugin is what actually generates those notifications — without it, you only see alarms that originate from connected instruments themselves.

Install `signalk-zones` from the SignalK app store (server admin panel → App Store), configure one or more zones on a path (e.g. `environment.water.temperature`), and the next time the value crosses the boundary WilhelmSK will alert.

#### Push notifications (`signalk-push-notifications`)

Push notifications deliver alarm alerts to your iPhone even when the WilhelmSK app is backgrounded or the phone is off the boat's Wi-Fi. The plugin handles two delivery paths:

- **Local push** — a persistent TCP connection from the app to the server; works on the same network, no internet required.
- **Remote push** — routes through AWS SNS; requires a brief one-time setup linking your Apple ID to the plugin's AWS backend.

See the [setup guide](https://github.com/sbender9/wilhelmsk-node-server-setup) for the AWS configuration steps.

#### Anchor alarm (`signalk-anchoralarm-plugin`)

The anchor alarm gauge in WilhelmSK shows a **Drop Anchor** button that sets a GPS fix and radius. The plugin watches the vessel's position and publishes a `notifications.anchoralarm.*` notification when the vessel drifts beyond the set radius. WilhelmSK picks that notification up through the standard alarm path, so you see and hear the alert even if the app is backgrounded (combined with the push notifications plugin).

#### Raymarine autopilot control (`signalk-raymarine-autopilot`)

This plugin bridges WilhelmSK's autopilot control panel to a Raymarine SeaTalk or EVO autopilot. It translates SignalK commands into the Raymarine proprietary protocol and exposes heading, wind mode, track mode, and tack/gybe controls to the app. Without this plugin the autopilot gauge is read-only (it will display current pilot state from NMEA 2000 but cannot send commands).

#### Fusion stereo control

WilhelmSK communicates with Fusion marine stereos via standard NMEA 2000 paths that SignalK already exposes. No additional plugin is needed — the stereo gauge works as long as your Fusion head unit is connected to the NMEA 2000 network and your SignalK server has a CAN bus interface.

#### AIS targets

AIS vessel data arrives through your AIS receiver, is decoded by SignalK, and appears in the `vessels.*` tree. WilhelmSK reads that data directly. No plugin is required.

#### Navionics track overlay

Your vessel's GPS track is logged by SignalK as `vessels.self.track`. WilhelmSK reads that path to draw the track on the Navionics chart. No plugin is needed, but the track is only as long as your server has been running — there is no persistent track storage unless you add a logging plugin such as `signalk-to-influxdb`.

#### Freeboard-SK integration

[Freeboard-SK](https://github.com/SignalK/freeboard-sk) is a browser-based chart plotter that runs alongside signalk-server-node. WilhelmSK can open a Freeboard-SK session in the in-app browser using the server's local address. No additional plugin is needed beyond having Freeboard-SK installed on the server.

---

### Installing plugins

1. Open the SignalK server admin panel (typically `http://<server-ip>:3000`).
2. Go to **App Store** and search for the plugin by name.
3. Install and restart the server.
4. Open the plugin's settings page and configure as needed.
5. Reconnect WilhelmSK — the new feature should appear automatically.

For a complete walkthrough of first-time server and plugin setup, see the [wilhelmsk-node-server-setup guide](https://github.com/sbender9/wilhelmsk-node-server-setup).

---

## Custom SignalK Paths

WilhelmSK is not limited to marine data. Any value available on a SignalK server can be displayed using a generic gauge — temperature sensors, relay states, pressure readings, power meters, or anything else a plugin pushes into the SignalK data model.

This guide covers how to configure gauges for arbitrary SignalK paths and walks through a complete non-marine example: a home HVAC and utility monitoring system.

---

### SignalK Path Naming Conventions

Every value in SignalK is identified by a dot-separated path. The structure follows a defined hierarchy:

```
<context>.<domain>.<instance>.<property>
```

Examples:
- `environment.inside.thermostat.KIDS_ROOM.temperature` — temperature at a named thermostat
- `electrical.batteries.house.voltage` — house battery bank voltage
- `propulsion.boiler.gasInput` — gas input to a boiler (non-marine)

The top-level segment is conventionally the vessel context (`vessels.self` is implied). Paths from the [SignalK specification](https://signalspec.signalk.org/) are standardised. Custom paths — created by plugins or third-party integrations — can use any naming, as long as they are unique within the server.

#### Units and Metadata

SignalK paths carry metadata alongside their values. The `meta.units` field tells clients what unit the value is in (e.g. `K` for Kelvin, `m/s` for speed). WilhelmSK uses this metadata to convert and display values in the units you select in preferences.

If a custom path does not include metadata, the app displays the raw value. For temperature paths, the server is expected to publish in Kelvin; the app converts to °C or °F based on your unit preference.

---

### Gauge Types for Custom Paths

Several built-in gauge types accept arbitrary paths:

| Gauge type | Best for | Notes |
|---|---|---|
| **Generic Number** (`TextGaugeConfig`) | Any numeric or string value | Configurable format string; no unit conversion |
| **WaterTempGauge** | Temperature values in Kelvin | Converts to °C/°F per preferences; works for any temperature path |
| **WattsGauge** | Power in watts | Works for any `*.power` or `*.watts` path |
| **SwitchBank** | Binary on/off relay states | Reads a path prefix; each child key becomes a labelled switch |

The **Generic Number** gauge is the most flexible: it displays any value at any path, formatted as a number or string. Use the specialised gauges (WaterTempGauge, WattsGauge) when you want unit conversion built in.

---

### Configuring a Generic Number Gauge

#### In the app (Layout Editor)

1. Open the layout editor by long-pressing any gauge slot.
2. Tap the slot you want to configure.
3. Scroll to **Generic** in the gauge picker and select **Generic Number**.
4. Enter the full SignalK path (e.g. `electrical.ac.arduinoThermPSI.psi`).
5. Set the display title and numeric format.
6. Tap **Done**.

#### In a `.wlyt` layout file

Layout files are JSON. A Generic Number gauge entry looks like this:

```json
"12": {
  "className": "TextGaugeConfig",
  "path": "electrical.ac.arduinoThermPSI.psi",
  "title": "Hydronic PSI",
  "valueLabelFormat": "%0.0f",
  "integerDigits": 0,
  "decimalDigits": 0,
  "defaultTitle": "Generic Number"
}
```

Key fields:

| Field | Description |
|---|---|
| `className` | Always `"TextGaugeConfig"` for the generic gauge |
| `path` | Full SignalK path to the value |
| `title` | Label shown on the gauge face |
| `valueLabelFormat` | Printf-style format: `"%0.0f"` for integers, `"%0.2f"` for two decimal places, `"%s"` for strings |
| `integerDigits` | Digits before the decimal point (for layout sizing) |
| `decimalDigits` | Digits after the decimal point |

---

### Worked Example: Home HVAC and Utility Monitoring with pivac

[pivac](https://github.com/dpnl87/pivac) is a Raspberry Pi-based data collection system that monitors a residential HVAC system, thermostats, boiler, and electrical circuits and publishes all readings to a local SignalK server. WilhelmSK connects to that server and displays the home data exactly as it would display boat data — no special configuration needed on the app side.

#### What pivac publishes

| SignalK path | What it represents |
|---|---|
| `environment.inside.thermostat.KIDS_ROOM.temperature` | Thermostat temperature reading, Kids Room |
| `environment.inside.thermostat.KIDS_ROOM.humidity` | Thermostat humidity reading, Kids Room |
| `environment.inside.hvac.IN.temperature.value` | Air handler supply air temperature |
| `environment.inside.hvac.OUT.temperature.value` | Return air temperature |
| `environment.inside.boiler.waterTemperature` | Hydronic boiler water temperature |
| `electrical.ac.arduinoThermPSI.psi` | Hydronic system pressure (PSI) |
| `electrical.ac.arduinoPSI.psi` | Potable domestic hot water pressure (PSI) |
| `propulsion.boiler.gasInput` | Gas input to boiler (BTU or flow rate) |
| `hvac.boiler.sentry.status` | Boiler control status (string) |
| `electrical.ac.switch.utility` | Relay bank for utility control switches |

#### Layout configuration

The pivac WilhelmSK layout (`wilhelmsk/iphone.wlyt`) demonstrates mixing gauge types on a single page:

**Thermostat gauges** use a dedicated `Thermostat` class that reads temperature, humidity, and state from three related paths under a shared prefix:

```json
"10": {
  "className": "Thermostat",
  "title": "Kids Room",
  "temperature": "environment.inside.thermostat.KIDS_ROOM.temperature",
  "humidity": "environment.inside.thermostat.KIDS_ROOM.humidity",
  "state": "environment.inside.thermostat.KIDS_ROOM.state",
  "setting": "environment.inside.setting"
}
```

**Temperature gauges** use `WaterTempGauge` for any Kelvin temperature path — including non-marine ones like HVAC supply air:

```json
"2": {
  "className": "WaterTempGauge",
  "path": "environment.inside.hvac.IN.temperature.value",
  "title": "HVAC In",
  "type": 1
}
```

**Generic numeric gauges** display PSI readings, gas input, and other values without a dedicated gauge class:

```json
"12": {
  "className": "TextGaugeConfig",
  "path": "electrical.ac.arduinoThermPSI.psi",
  "title": "Hydronic PSI",
  "valueLabelFormat": "%0.0f",
  "integerDigits": 0,
  "decimalDigits": 0,
  "defaultTitle": "Generic Number"
},
"16": {
  "className": "TextGaugeConfig",
  "path": "hvac.boiler.sentry.status",
  "title": "Boiler Status",
  "valueLabelFormat": "%s",
  "integerDigits": 0,
  "decimalDigits": 0,
  "defaultTitle": "Generic Number"
}
```

**Switch banks** map a path prefix to a row of toggle controls:

```json
"11": {
  "className": "SwitchBank",
  "path": "electrical.ac.switch.utility",
  "title": "Control Relays"
}
```

#### Result

A single WilhelmSK layout page shows room temperatures, HVAC duct temperatures, boiler status, system pressures, and relay controls — all pulled from a home automation system with no changes to the app. The SignalK protocol is the only interface.

---

### Tips for Working with Custom Paths

**Browse available paths first.** Open the SignalK server's data browser (usually at `http://<server>:3000/signalk/v1/api/vessels/self`) to see what paths are available and what format the values take before configuring gauges.

**Match the value type to the format string.** Numeric values need `%0.Nf` (where N is decimal places); string values need `%s`. Mixing these causes the gauge to show nothing or display incorrectly.

**Temperature paths expect Kelvin.** If you use `WaterTempGauge` for a custom temperature path, the server must publish the value in Kelvin (as the SignalK spec requires). If your plugin publishes in Celsius or Fahrenheit, use `TextGaugeConfig` with a `%0.1f` format instead and set the title to include the unit.

**Use SwitchBank for grouped binary states.** If your plugin publishes several on/off values under a common path prefix (e.g. `electrical.ac.switch.utility.pump`, `electrical.ac.switch.utility.fan`), a single `SwitchBank` gauge pointing at the prefix (`electrical.ac.switch.utility`) will display all of them as labelled toggles.
