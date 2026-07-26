# DETERMINATION — an Undertale-inspired browser shell

## Want a finished installer without touching a terminal at all?

This project includes a GitHub Actions workflow (`.github/workflows/build.yml`)
that builds real installers for Windows, Mac, and Linux automatically in the
cloud — you only ever click things on a website, no command line:

1. Go to [github.com](https://github.com) and make a free account if you
   don't have one.
2. Click the **+** in the top right → **New repository**. Name it anything
   (e.g. `determination-browser`), leave it public or private, click
   **Create repository**.
3. On the new repo's page, click **uploading an existing file**, then drag
   the entire unzipped `undertale-browser` folder contents into the browser
   window. Scroll down and click **Commit changes**.
4. Click the **Actions** tab at the top of the repo. You'll see "Build
   Installers" running (it starts automatically after step 3). Wait a few
   minutes — it's building all three platforms at once.
5. Once it finishes (green checkmark), click into that workflow run. Under
   **Artifacts** at the bottom, you'll see `determination-windows-latest`,
   `determination-macos-latest`, and `determination-ubuntu-latest` — each a
   zip containing the finished installer for that OS.
6. Download the one matching your computer, unzip it, and double-click the
   installer inside (`.exe`, `.dmg`, or `.AppImage`/`.deb`). That's it — it
   installs like any normal app, with a real desktop shortcut and everything.

Everything below this point is for people who *do* want to build locally
with the command line — skip it if the above worked for you.

A fully custom, hand-styled browser UI running on real Chromium, via Electron.
Every pixel of the window chrome — titlebar, tabs, address bar, buttons — is
yours: plain HTML/CSS/JS. The actual page rendering underneath is genuine
Chromium (through Electron's `<webview>` tag), so any site you load behaves
like it would in Chrome.

This does **not** use any Undertale game files, sprites, or fonts — those are
copyrighted. Instead it borrows the *aesthetic language* of the game's battle
UI (black background, hard white borders, no rounded corners, pixel type) and
the seven SOUL trait colors as a built-in theme switcher.

## Run it

You'll need [Node.js](https://nodejs.org) installed (v18+).

```bash
cd undertale-browser
npm install
npm start
```

That's it — a window opens with the custom UI.

## What's inside

- `src/main.js` — Electron main process: creates a frameless `BrowserWindow`
  and wires up window controls (minimize/maximize/close) since the native
  frame is gone.
- `src/preload.js` — the only bridge between the UI and Node/Electron APIs,
  kept minimal and context-isolated for safety.
- `src/index.html` / `styles.css` / `renderer.js` — the actual browser shell:
  tab strip, address bar, navigation buttons, theme picker, and the
  `<webview>` elements that do the real browsing.

## Customizing further

- **Themes**: edit the `THEMES` object at the top of `renderer.js` — each
  entry is a color plus a flavor-text line shown under the address bar.
- **Fonts**: currently pulling `Press Start 2P` (UI chrome) and `VT323`
  (address bar / body text) from Google Fonts in `styles.css`. Swap in your
  own `.woff2` files locally if you'd rather not depend on the network for
  the UI font.
- **Home page**: change `HOME_URL` in `renderer.js`.
- **Sound**: there's no audio yet. A menu-blip sound on tab switch or
  navigation would fit the aesthetic well — drop an `.ogg`/`.mp3` into
  `assets/` and play it in the relevant event handlers in `renderer.js`.

## Building a real installer

This is already wired up with [electron-builder](https://www.electron.build/),
so one command produces the same kind of installer you'd get downloading any
normal browser: a double-click `.exe` wizard on Windows, a drag-to-Applications
`.dmg` on Mac, or an `.AppImage`/`.deb` on Linux.

```bash
npm install

# build for the OS you're currently on
npm run dist:win     # -> dist/Determination Setup <version>.exe
npm run dist:mac     # -> dist/Determination-<version>.dmg
npm run dist:linux   # -> dist/Determination-<version>.AppImage and .deb
```

Run whichever one matches your OS. The resulting installer:

- Installs to Program Files (Win) / Applications (Mac) / wherever your distro
  puts `.deb` packages (Linux)
- Creates a desktop shortcut and Start Menu entry (Windows, via the `nsis`
  block in `package.json`)
- Uses the pixel-heart icon in `build/icon.png` / `build/icon.ico` as the app
  icon everywhere — taskbar, dock, installer wizard, shortcuts

**Important platform note:** you have to build on (or for) the OS you're
targeting. `electron-builder` can cross-compile Windows and Linux targets
from any OS, but a signed, distributable `.dmg` generally needs to be built
on an actual Mac. If you just want to test locally, `npm start` (no
installer, just runs the app directly) is the fastest loop — reach for the
`dist:*` scripts once you're ready to hand the app to someone else.

No code signing is configured, so Windows SmartScreen and macOS Gatekeeper
will show an "unknown publisher" warning on first launch — expected for an
unsigned indie app. Getting rid of that requires a paid code-signing
certificate (Windows) or an Apple Developer account (Mac), both out of scope
for a personal project like this.
