# Catatan

Pelacak pekerjaan dan proyek pribadi. Berjalan sebagai PWA: bisa dipasang di HP/desktop dan dipakai offline. Semua data tersimpan di perangkat (localStorage), tanpa login dan tanpa server.

## Fitur

- **Item pekerjaan** dengan status, prioritas, label, tanggal mulai/tenggat, sub-item, siklus, dan modul
- **Lima tampilan**: Daftar, Papan (seret-lepas), Kalender, Tabel, Linimasa
- **Filter**, pengelompokan, dan **tampilan tersimpan**
- **Siklus**, **Modul**, **Halaman** (catatan proyek), **Catatan tempel**, **Analitik**
- Pencarian global, dwibahasa (Indonesia/English), tema gelap/terang
- Ekspor/impor cadangan JSON di Pengaturan

## Menjalankan

```bash
npm install
```

```bash
npm run dev
```

Build produksi (service worker hanya aktif di hasil build):

```bash
npm run build
```

```bash
npm run preview
```

## Deploy

Proyek Vite statis; di Vercel cukup impor repo ini tanpa konfigurasi tambahan (perintah build `npm run build`, keluaran `dist`).

## Struktur

- `src/store.ts` — data dan aksi (Zustand + persist ke localStorage, kunci `catatan-v1`)
- `src/i18n.ts` — semua teks antarmuka dalam dua bahasa
- `src/components/ItemsView.tsx` — lima tampilan item
- `src/components/ItemPeek.tsx` — panel detail dan dialog buat item
- `src/pages/` — halaman
- `scripts/make-icons.mjs` — pembuat ikon PWA

## Catatan

Data hanya ada di browser tempat aplikasi dipakai. Menghapus data situs akan menghapus semuanya, jadi ekspor cadangan secara berkala.
