// Membuat ikon PNG PWA dari SVG. Jalankan: node scripts/make-icons.mjs
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="512" height="512" rx="${pad ? 0 : 112}" fill="#0f1115"/><g transform="${pad ? 'translate(64 64) scale(.75)' : ''}"><rect x="120" y="136" width="272" height="44" rx="22" fill="#f5b83d"/><rect x="120" y="234" width="200" height="44" rx="22" fill="#f5b83d" opacity=".7"/><rect x="120" y="332" width="128" height="44" rx="22" fill="#f5b83d" opacity=".4"/></g></svg>`
const b = await chromium.launch()
for (const [name, size, pad] of [['icon-192', 192, false], ['icon-512', 512, false], ['icon-maskable-512', 512, true], ['apple-touch-icon', 180, true]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } })
  await p.setContent(`<body style="margin:0;background:transparent">${svg(pad)}</body>`)
  await p.screenshot({ path: `public/${name}.png`, omitBackground: true })
  await p.close()
}
await b.close()
