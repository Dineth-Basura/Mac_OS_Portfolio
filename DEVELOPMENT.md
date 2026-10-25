# Desktop portfolio

Open `index.html` directly for the desktop and Contact mode. AI mode requires the server. To run the complete portfolio locally (Node.js 22+), run `node --env-file=.env server/dev.cjs` from this folder and open http://localhost:3000. No package installation is required for the server. The provided Gemini key is stored in the ignored `.env` file. Use HTTPS on the public website.

## Architecture

| Path | Responsibility |
| --- | --- |
| `index.html` | Desktop markup and ordered script entry points |
| `assets/css/desktop.css` | Base desktop, wallpaper, vectors, widgets |
| `assets/css/system.css` | Interactive shell, app layouts, dark mode, responsive styling |
| `assets/js/data/icons.js` | Inline SVG app icon library |
| `assets/images/app_icons/` | Uploaded app artwork; matched through `iconImages` in `data/icons.js` |
| `assets/js/data/icon-metrics.js` | Measured artwork bounds, keeping SVG and PNG assets visually aligned |
| `assets/css/icons.css` | Consistent desktop/Dock sizes and artwork alignment |
| `assets/js/data/apps.js` | Desktop and Dock app registry, external app links |
| `assets/js/core/state.js` | Shared state, preferences, safe storage, activation |
| `assets/js/core/windows.js` | Create, focus, resize, drag, close, minimize, restore, Dock |
| `assets/js/apps/views.js` | Portfolio content and project repository links |
| `assets/js/apps/behaviors.js` | Finder, Notes, camera, terminal, settings |
| `assets/js/system/shell.js` | Menu bar, keyboard shortcuts, context menu, Spotlight, Control Center |
| `assets/js/system/widgets.js` | Clock, calendar, locally saved events |
| `assets/js/system/boot.js` | Video startup, reduced motion, fallback, lock screen |
| `assets/js/system/desktop-layout.js` | Pointer dragging, keyboard nudges, responsive saved icon/widget positions |
| `assets/js/apps/dinu.js` | Dinu orb, message form, email draft and optional direct delivery |
| `assets/js/data/contact.js` | Contact recipient and optional HTTPS message endpoint |
| `assets/css/enhancements.css` | Refined app surfaces, free desktop layout, Dinu visuals |
| `assets/js/main.js` | Desktop selection and application initialization |
| `assets/images/` | Wallpaper assets |
| `assets/documents/` | CV PDF |
| `assets/video/` | Startup video |
| `tests/desktop.cjs` | Browser integration checks |

Scripts use ordered `defer` tags, so the project works from `file://` as well as static hosting. Modules are separated by responsibility without requiring a server for ES module loading. `Desktop` is the shared state object; `appViews` defines window contents; `desktopApps` and `dockApps` define launchers. Add an app to those registries, add a view in `apps/views.js`, then initialize its behavior in `setupApp()`.

Preferences, notes, and calendar events are saved under `desktop.*` local-storage keys. User-entered notes and events are rendered as text or escaped HTML. Camera tracks are stopped when its window closes, minimizes, locks, or leaves the page. Browser clipboard access can require a user permission; keyboard shortcuts remain available.

Desktop icons select on click and open on double-click or Enter; touch opens on one tap. Dock icons open and restore. Window resizing uses the lower-right corner. Menus support keyboard navigation. Spotlight supports arrow keys and Enter. Escape dismisses menus/search. Ctrl/Command + Space opens Spotlight; Ctrl/Command + W closes; Ctrl/Command + M minimizes; Ctrl/Command + N opens Finder. Browsers can reserve some shortcuts.

This is a macOS-inspired web interface, not an operating system. Network status and available battery readings come from the browser. Brightness, sound and Focus affect the web desktop. Weather links to current Colombo weather rather than displaying made-up readings. Lock Screen is a visual desktop state, not authentication.

The older `src/`, `public/`, and `dist/` Astro portfolio folders are retained. They are separate from this static desktop; do not deploy `dist/` for this version. `index (1).html` redirects to the canonical `index.html` to avoid divergent copies.

Run the browser checks with `node tests/desktop.cjs` when Playwright and Chrome are installed. On restrictive Windows environments, point TEMP and TMP to a writable project folder before running.

Desktop icons and each widget can be dragged separately. Positions use normalized coordinates, persist under `desktop.layout`, and stay within the available screen area when the viewport changes. Use Alt + arrow keys on a focused icon, or arrow keys on a widget's grip, to nudge its position. Right-click the desktop and choose **Reset Icon & Widget Positions** to restore the arrangement. Small screens hide widgets to keep apps accessible.

Dinu has **Contact** and **Dinu AI** tabs. Contact posts JSON to Web3Forms using its public access key in `assets/js/data/contact.js`. It only reports success when the response includes `success: true`; failures keep the visitor’s message. A hidden honeypot blocks simple automated submissions. The destination is the email account associated with that Web3Forms key.

AI uses `/api/dinu-chat`. The browser sends a bounded conversation to the server; the server calls Gemini with the key from `GEMINI_API_KEY`. The key never enters the public assets. Chat history lasts only while the app window is open. New Chat clears it. The server validates roles/lengths, limits output, checks browser origin, adds a per-instance request limit, and returns readable errors without returning provider diagnostics or credentials. Model selection uses `GEMINI_MODEL` (default `gemini-3.8-flash`). API availability and quotas depend on the configured Google account.

**Local:** `node --env-file=.env server/dev.cjs`, then http://localhost:3000. Live Server and double-clicking HTML do not provide the AI route.

**Netlify:** import this repository; `netlify.toml` builds the public `site/` directory and deploys `netlify/functions/dinu-chat.cjs`. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in Netlify’s environment settings with Functions scope, then deploy. The local `.env` is ignored by git and is not included in `site/`. The build publishes only `index.html` and `assets/`. A public static host can serve the desktop and Contact; AI needs the supplied function or an equivalent server route. No production deployment was performed by this change.

Files: `server/dinu-chat.cjs` contains the Gemini adapter and verified portfolio facts; `server/dev.cjs` serves only the public files and AI endpoint; `assets/js/apps/dinu-ai.js` contains chat UI behavior; `assets/css/dinu-ai.css` styles it. `tests/dinu-api.cjs` checks provider request/response handling with mocked APIs and does not send real email.

Provider references: https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript and https://ai.google.dev/api/generate-content .

Run `node tests/desktop-layout.cjs` for drag persistence, launch suppression, layout reset, and Dinu contact submission checks.
