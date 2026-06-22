<div align="center">
  <img src="public/logo-readme.svg" width="100" alt="Chroma logo"/>
  <h1>Chroma — SVG Color Studio</h1>
  <p>A web-based tool to recolor SVGs visually</p>
  <p><a href="https://chroma-svg.pages.dev/" target="_blank">https://chroma-svg.pages.dev/</a></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-58C4DC?logo=react&logoColor=white" alt="React 19"/>
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"/>
    <img src="https://img.shields.io/badge/Cloudflare_Pages-380D0E?logo=cloudflare&logoColor=white" alt="Cloudflare Pages"/>
  </p>
</div>

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎨 | **Upload & Recolor** | Drag & drop SVG, click any color to edit inline |
| 🖼️ | **Multi-SVG Tabs** | Work with multiple files simultaneously (up to 5) |
| 🎯 | **Palette Gallery** | Browse trending palettes from Coolors, preview before applying |
| 🖌️ | **Color Harmonies** | Generate complementary, analogous, triadic, and more |
| 📷 | **Image Extraction** | Upload PNG/JPG to extract dominant color palettes |
| 🧩 | **Theme Preview** | See your palette on real UI components (buttons, cards, tabs) |
| 💾 | **Export** | Download recolored SVG, CSS tokens, JSON map, or named color matrix |
| ↩️ | **Undo/Redo** | Ctrl+Z / Ctrl+Shift+Z — full history support |
| 💾 | **Auto-save** | Persists to localStorage; share via URL hash |
| 📱 | **Responsive** | Works on desktop and mobile with slide-out sidebar |

## 🛠️ Stack

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="40"/><br/><b>React 19</b></td>
      <td align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="40"/><br/><b>TypeScript</b></td>
      <td align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="40"/><br/><b>Vite 8</b></td>
      <td align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="40"/><br/><b>Tailwind 4</b></td>
      <td align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitest/vitest-original.svg" width="40"/><br/><b>Vitest</b></td>
    </tr>
  </table>
</div>

## 🚀 Getting Started

```bash
# Install
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Tests
npm test
npm run test:e2e    # Playwright E2E

# Deploy to Cloudflare Pages
npm run deploy
```

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last color change |
| `Ctrl+Shift+Z` | Redo |
| `R` | Reset all colors |
| `E` | Open export dialog |
| `?` | Show keyboard shortcuts |

## 📄 License

MIT
