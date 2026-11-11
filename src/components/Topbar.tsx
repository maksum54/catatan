import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Languages, Menu as MenuIcon, Moon, Search, Sun, WifiOff } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'
import { StateIcon } from './ui'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const t = useT()
  const s = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  const results = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return null
    const key = (pid: string, seq: number) => `${s.projects.find((p) => p.id === pid)?.identifier}-${seq}`
    return {
      items: s.items.filter((i) => i.title.toLowerCase().includes(k) || key(i.projectId, i.seq).toLowerCase().includes(k)).slice(0, 8).map((i) => ({ ...i, key: key(i.projectId, i.seq) })),
      pages: s.pages.filter((p) => p.title.toLowerCase().includes(k) || p.content.toLowerCase().includes(k)).slice(0, 4),
    }
  }, [q, s.items, s.pages, s.projects])
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-3">
      <button type="button" className="btn-ghost md:hidden" onClick={onMenu} aria-label={t('menu')}><MenuIcon size={18} /></button>
      <div className="hidden w-56 items-center gap-2 md:flex">
        <img src="/favicon.svg" alt="" className="size-6 rounded" /><span className="text-sm font-semibold">Catatan</span>
      </div>
      <div className="relative mx-auto w-full max-w-md">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        <input type="search" aria-label={t('search')} placeholder={t('search')} className="input !pl-8" value={q}
          onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} />
        {focus && results && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[60vh] overflow-auto rounded-lg border border-line bg-raised p-1 shadow-xl">
            {results.items.length + results.pages.length === 0 && <div className="px-3 py-2 text-[13px] text-muted">{t('noResults')}</div>}
            {results.items.map((i) => (
              <button key={i.id} type="button" className="menu-item"
                onMouseDown={() => { nav(`/p/${i.projectId}/items`, { state: { peek: i.id } }); s.setPeek(i.id); setQ('') }}>
                <StateIcon state={i.state} /><span className="text-xs text-muted">{i.key}</span><span className="truncate">{i.title}</span>
              </button>
            ))}
            {results.pages.map((p) => (
              <button key={p.id} type="button" className="menu-item" onMouseDown={() => { nav(`/p/${p.projectId}/pages/${p.id}`); setQ('') }}>
                <FileText size={14} className="text-muted" /><span className="truncate">{p.title || t('untitled')}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {!online && (
        <span className="hidden items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-muted sm:inline-flex" role="status">
          <WifiOff size={13} />{t('offline')}
        </span>
      )}
      {!online && <WifiOff size={16} className="text-muted sm:hidden" aria-label={t('offline')} />}
      <button type="button" className="btn-ghost" onClick={() => s.setLang(s.lang === 'id' ? 'en' : 'id')} title={t('language')} aria-label={t('language')}>
        <Languages size={16} /><span className="text-xs font-semibold uppercase">{s.lang}</span>
      </button>
      <button type="button" className="btn-ghost" onClick={() => s.setTheme(s.theme === 'dark' ? 'light' : 'dark')} title={t('theme')} aria-label={t('theme')}>
        {s.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  )
}
