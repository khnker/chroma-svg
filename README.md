# Chroma — SVG Color Studio

A web-based tool to recolor SVGs. Upload an SVG, replace its colors visually, preview palettes, and export.

## Features

- **Upload & recoloring** — drag & drop SVG, click any color to edit
- **Multi-SVG** — work with multiple files in tabs (up to 5)
- **Palettes** — browse trending palettes from Coolors, preview before applying
- **Gallery** — see your SVG with different palette combinations at a glance
- **Image upload** — extract color palettes from PNGs/JPGs
- **Theme preview** — see how your palette looks on real UI components
- **Export** — download recolored SVG, CSS tokens, JSON map, or named color matrix
- **Undo/redo** — keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
- **Session persistence** — your work auto-saves to localStorage; share via URL hash
- **Responsive** — works on desktop and mobile with drawer sidebar

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Vitest · Playwright

## Development

```bash
npm install
npm run dev       # dev server (http://localhost:5173)
npm run build     # production build
npm test          # unit tests
npm run test:e2e  # Playwright e2e
```

## License

MIT
