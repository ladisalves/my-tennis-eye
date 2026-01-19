# my-tennis-eye
Was it in or out?

## Phase 1 Prototype
The Phase 1 prototype uses `index.html` at the repo root with TypeScript and styles in `src/`. It provides a mobile-first calibration UI for mapping a tennis court corner. It uses a video element, a canvas overlay, and OpenCV.js (loaded via CDN) to warp "in" and "out" zone overlays on top of the live camera feed.

No build tooling is configured yet; the TypeScript file is provided to guide the expected implementation. If you add a build step later, document it here.

## Running the Prototype (Vite + TypeScript)
Camera access requires a secure context, so run from `localhost` (or HTTPS) instead of opening the file directly.

1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`
3. Open the URL shown in the terminal (typically `http://localhost:5173`) on a mobile device and allow camera access.

### Useful Scripts
- `npm run build` — production build.
- `npm run preview` — preview the production build locally.
- `npm run typecheck` — run TypeScript checks without emitting files.
- `npm run lint` — run ESLint on `src/`.
- `npm run format` — format the codebase with Prettier.
