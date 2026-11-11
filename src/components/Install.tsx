import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { useT } from '../i18n'

interface BIP extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
let deferred: BIP | null = null
const subs = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as BIP; subs.forEach((f) => f()) })
  window.addEventListener('appinstalled', () => { deferred = null; subs.forEach((f) => f()) })
}

/** Mengembalikan fungsi pemasangan bila browser menawarkan instalasi, selain itu null. */
export function useInstall() {
  const [, tick] = useState(0)
  useEffect(() => { const f = () => tick((n) => n + 1); subs.add(f); return () => { subs.delete(f) } }, [])
  if (!deferred) return null
  return async () => { const d = deferred; if (!d) return; await d.prompt(); await d.userChoice; deferred = null; subs.forEach((f) => f()) }
}

const KEY = 'catatan-install-dismissed'
export function InstallBanner() {
  const t = useT()
  const install = useInstall()
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem(KEY) === '1' } catch { return true } })
  // Tunda sampai pengguna sudah memakai aplikasi sebentar, jangan langsung di awal.
  useEffect(() => { const id = setTimeout(() => setReady(true), 45000); return () => clearTimeout(id) }, [])
  if (!install || !ready || dismissed) return null
  const dismiss = () => { setDismissed(true); try { localStorage.setItem(KEY, '1') } catch { /* abaikan */ } }
  return (
    <div className="fixed bottom-3 left-3 right-3 z-20 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-line bg-raised p-3 shadow-xl">
      <Download size={18} className="shrink-0 text-accent" />
      <p className="min-w-0 flex-1 text-[13px]">{t('installHint')}</p>
      <button type="button" className="btn-primary" onClick={install}>{t('install')}</button>
      <button type="button" className="btn-ghost" onClick={dismiss} aria-label={t('later')}><X size={16} /></button>
    </div>
  )
}
