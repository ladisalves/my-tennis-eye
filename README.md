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

## Calibration Process (4 Points)
The calibration defines the court corner and real-world scale. Tap the four points in order:

1. **P1 — Corner vertex**: Tap the exact intersection of the baseline and sideline (inside corner of the “L”).
2. **P2 — Baseline direction**: Tap a point further down the baseline from P1, staying on the same line.
3. **P3 — Sideline direction**: Tap a point further down the sideline from P1, staying on that line.
4. **P4 — Line width marker**: Tap the opposite edge of the same white line at P1 (across the line’s width, not along it).

Tips:
- Use the loupe to place taps precisely on the painted line edges.
- Place P2 and P3 as far from P1 as possible within the frame for better perspective accuracy.
- P4 should be perpendicular to the line, directly across the stripe from P1.
