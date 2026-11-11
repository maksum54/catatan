import { useCallback } from 'react'
import { useStore } from './store'
import type { Lang } from './types'

const id = {
  appTagline: 'Pelacak pekerjaan pribadi',
  home: 'Beranda', stickies: 'Catatan tempel', projects: 'Proyek', settings: 'Pengaturan', workspace: 'Ruang kerja',
  workItems: 'Item pekerjaan', cycles: 'Siklus', modules: 'Modul', views: 'Tampilan', pages: 'Halaman', analytics: 'Analitik',
  newWorkItem: 'Item baru', addWorkItem: 'Tambah item', search: 'Cari item dan halaman…', noResults: 'Tidak ada hasil',
  'state.backlog': 'Backlog', 'state.todo': 'Akan dikerjakan', 'state.in_progress': 'Sedang dikerjakan', 'state.done': 'Selesai', 'state.cancelled': 'Dibatalkan',
  'priority.urgent': 'Mendesak', 'priority.high': 'Tinggi', 'priority.medium': 'Sedang', 'priority.low': 'Rendah', 'priority.none': 'Tidak ada',
  'layout.list': 'Daftar', 'layout.board': 'Papan', 'layout.calendar': 'Kalender', 'layout.table': 'Tabel', 'layout.gantt': 'Linimasa',
  'group.state': 'Status', 'group.priority': 'Prioritas', 'group.cycle': 'Siklus', 'group.module': 'Modul', 'group.none': 'Tanpa grup',
  filters: 'Filter', display: 'Tampilan', groupBy: 'Kelompokkan', showSub: 'Tampilkan sub-item', clear: 'Bersihkan', saveView: 'Simpan sebagai tampilan',
  state: 'Status', priority: 'Prioritas', labels: 'Label', startDate: 'Tanggal mulai', dueDate: 'Tenggat', parent: 'Induk', cycle: 'Siklus', module: 'Modul',
  none: 'Tidak ada', title: 'Judul', description: 'Deskripsi', descriptionPh: 'Tambahkan deskripsi…', titlePh: 'Judul item',
  subItems: 'Sub-item', addSubItem: 'Tambah sub-item', properties: 'Properti', newLabel: 'Label baru…',
  created: 'Dibuat', updated: 'Diperbarui', completed: 'Diselesaikan',
  delete: 'Hapus', cancel: 'Batal', save: 'Simpan', create: 'Buat', edit: 'Ubah', close: 'Tutup', add: 'Tambah', name: 'Nama', project: 'Proyek',
  confirmDelete: 'Hapus ini? Tindakan ini tidak bisa dibatalkan.',
  confirmDeleteProject: 'Hapus proyek beserta semua item, siklus, modul, tampilan, dan halamannya?',
  emptyItems: 'Belum ada item', emptyItemsHint: 'Buat item pertama untuk mulai melacak pekerjaan.',
  emptyFiltered: 'Tidak ada item yang cocok dengan filter.',
  noDates: 'Item tanpa tanggal tidak tampil di sini. Beri tanggal mulai atau tenggat.',
  today: 'Hari ini', identifier: 'Kode', emoji: 'Emoji', newProject: 'Proyek baru', emptyProjects: 'Belum ada proyek',
  newCycle: 'Siklus baru', active: 'Aktif', upcoming: 'Mendatang', completedTab: 'Selesai', draft: 'Draf', emptyCycles: 'Belum ada siklus di tab ini',
  endDate: 'Tanggal selesai', newModule: 'Modul baru', emptyModules: 'Belum ada modul', targetDate: 'Target',
  'mstatus.planned': 'Direncanakan', 'mstatus.active': 'Berjalan', 'mstatus.paused': 'Dijeda', 'mstatus.completed': 'Selesai',
  newView: 'Tampilan baru', emptyViews: 'Belum ada tampilan tersimpan', emptyViewsHint: 'Atur filter di Item pekerjaan, lalu pilih "Simpan sebagai tampilan".',
  viewName: 'Nama tampilan', allItems: 'Semua item',
  newPage: 'Halaman baru', emptyPages: 'Belum ada halaman', untitled: 'Tanpa judul', pagePh: 'Mulai menulis…',
  newSticky: 'Catatan baru', emptyStickies: 'Belum ada catatan tempel', stickyPh: 'Tulis sesuatu…',
  total: 'Total', open: 'Terbuka', overdue: 'Terlambat', byState: 'Per status', byPriority: 'Per prioritas', byLabel: 'Per label',
  last14: '14 hari terakhir', createdSeries: 'Dibuat', completedSeries: 'Diselesaikan', progress: 'Kemajuan',
  greetMorning: 'Selamat pagi', greetAfternoon: 'Selamat siang', greetEvening: 'Selamat malam',
  recent: 'Terakhir diperbarui', dueSoon: 'Tenggat terdekat', nothingDue: 'Tidak ada tenggat dalam waktu dekat',
  language: 'Bahasa', theme: 'Tema', dark: 'Gelap', light: 'Terang',
  data: 'Data', dataHint: 'Semua data tersimpan di perangkat ini (localStorage). Ekspor secara berkala sebagai cadangan.',
  exportData: 'Ekspor cadangan (JSON)', importData: 'Impor cadangan', resetData: 'Hapus semua data',
  confirmReset: 'Hapus SEMUA data di perangkat ini? Ekspor cadangan dulu bila perlu.',
  confirmImport: 'Impor akan menimpa semua data saat ini. Lanjutkan?', importOk: 'Cadangan berhasil diimpor.', importFail: 'Berkas cadangan tidak valid.',
  offline: 'Offline — data tersimpan di perangkat', install: 'Pasang aplikasi', installHint: 'Pasang Catatan supaya bisa dibuka seperti aplikasi dan dipakai offline.', later: 'Nanti',
  menu: 'Menu', more: 'Lainnya', openItem: 'Buka', items: 'item', prev: 'Sebelumnya', next: 'Berikutnya', noProject: 'Proyek tidak ditemukan',
}
const en: typeof id = {
  appTagline: 'Personal work tracker',
  home: 'Home', stickies: 'Stickies', projects: 'Projects', settings: 'Settings', workspace: 'Workspace',
  workItems: 'Work items', cycles: 'Cycles', modules: 'Modules', views: 'Views', pages: 'Pages', analytics: 'Analytics',
  newWorkItem: 'New item', addWorkItem: 'Add item', search: 'Search items and pages…', noResults: 'No results',
  'state.backlog': 'Backlog', 'state.todo': 'Todo', 'state.in_progress': 'In progress', 'state.done': 'Done', 'state.cancelled': 'Cancelled',
  'priority.urgent': 'Urgent', 'priority.high': 'High', 'priority.medium': 'Medium', 'priority.low': 'Low', 'priority.none': 'None',
  'layout.list': 'List', 'layout.board': 'Board', 'layout.calendar': 'Calendar', 'layout.table': 'Table', 'layout.gantt': 'Timeline',
  'group.state': 'State', 'group.priority': 'Priority', 'group.cycle': 'Cycle', 'group.module': 'Module', 'group.none': 'No grouping',
  filters: 'Filters', display: 'Display', groupBy: 'Group by', showSub: 'Show sub-items', clear: 'Clear', saveView: 'Save as view',
  state: 'State', priority: 'Priority', labels: 'Labels', startDate: 'Start date', dueDate: 'Due date', parent: 'Parent', cycle: 'Cycle', module: 'Module',
  none: 'None', title: 'Title', description: 'Description', descriptionPh: 'Add a description…', titlePh: 'Item title',
  subItems: 'Sub-items', addSubItem: 'Add sub-item', properties: 'Properties', newLabel: 'New label…',
  created: 'Created', updated: 'Updated', completed: 'Completed',
  delete: 'Delete', cancel: 'Cancel', save: 'Save', create: 'Create', edit: 'Edit', close: 'Close', add: 'Add', name: 'Name', project: 'Project',
  confirmDelete: 'Delete this? This cannot be undone.',
  confirmDeleteProject: 'Delete this project with all its items, cycles, modules, views, and pages?',
  emptyItems: 'No items yet', emptyItemsHint: 'Create your first item to start tracking work.',
  emptyFiltered: 'No items match the filters.',
  noDates: 'Items without dates are not shown here. Set a start or due date.',
  today: 'Today', identifier: 'Key', emoji: 'Emoji', newProject: 'New project', emptyProjects: 'No projects yet',
  newCycle: 'New cycle', active: 'Active', upcoming: 'Upcoming', completedTab: 'Completed', draft: 'Draft', emptyCycles: 'No cycles in this tab',
  endDate: 'End date', newModule: 'New module', emptyModules: 'No modules yet', targetDate: 'Target',
  'mstatus.planned': 'Planned', 'mstatus.active': 'Active', 'mstatus.paused': 'Paused', 'mstatus.completed': 'Completed',
  newView: 'New view', emptyViews: 'No saved views yet', emptyViewsHint: 'Set filters in Work items, then choose "Save as view".',
  viewName: 'View name', allItems: 'All items',
  newPage: 'New page', emptyPages: 'No pages yet', untitled: 'Untitled', pagePh: 'Start writing…',
  newSticky: 'New sticky', emptyStickies: 'No stickies yet', stickyPh: 'Write something…',
  total: 'Total', open: 'Open', overdue: 'Overdue', byState: 'By state', byPriority: 'By priority', byLabel: 'By label',
  last14: 'Last 14 days', createdSeries: 'Created', completedSeries: 'Completed', progress: 'Progress',
  greetMorning: 'Good morning', greetAfternoon: 'Good afternoon', greetEvening: 'Good evening',
  recent: 'Recently updated', dueSoon: 'Due soon', nothingDue: 'Nothing due soon',
  language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light',
  data: 'Data', dataHint: 'All data is stored on this device (localStorage). Export regularly as a backup.',
  exportData: 'Export backup (JSON)', importData: 'Import backup', resetData: 'Delete all data',
  confirmReset: 'Delete ALL data on this device? Export a backup first if needed.',
  confirmImport: 'Importing will overwrite all current data. Continue?', importOk: 'Backup imported.', importFail: 'Invalid backup file.',
  offline: 'Offline — data is saved on this device', install: 'Install app', installHint: 'Install Catatan to open it like an app and use it offline.', later: 'Later',
  menu: 'Menu', more: 'More', openItem: 'Open', items: 'items', prev: 'Previous', next: 'Next', noProject: 'Project not found',
}
export type TKey = keyof typeof id
const dict: Record<Lang, typeof id> = { id, en }
export type T = (k: TKey) => string

export function useT(): T {
  const lang = useStore((s) => s.lang)
  return useCallback((k: TKey) => dict[lang][k] ?? k, [lang])
}
export function useFmtDate() {
  const lang = useStore((s) => s.lang)
  return useCallback(
    (s: string | null | undefined, withYear = false) =>
      s
        ? new Date(s.length === 10 ? s + 'T00:00:00' : s).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
            day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}),
          })
        : '',
    [lang],
  )
}
