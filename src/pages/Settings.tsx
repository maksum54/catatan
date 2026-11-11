import { useRef } from 'react'
import { Download, Settings as Cog, Trash2, Upload } from 'lucide-react'
import { DATA_KEYS, useStore, type Data } from '../store'
import { useT } from '../i18n'
import { PageHeader } from '../components/ui'
import { useInstall } from '../components/Install'
import { today } from '../lib'

export function Settings() {
  const t = useT()
  const s = useStore()
  const file = useRef<HTMLInputElement>(null)
  const install = useInstall()
  const seg = (on: boolean) => `px-3 py-1.5 text-[13px] ${on ? 'bg-accent font-semibold text-accent-fg' : 'text-muted hover:bg-hover'}`
  const doExport = () => {
    const data = Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]]))
    const url = URL.createObjectURL(new Blob([JSON.stringify({ app: 'catatan', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = `catatan-${today()}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  const doImport = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text())
      const d = parsed?.data
      if (parsed?.app !== 'catatan' || !d || !DATA_KEYS.every((k) => Array.isArray(d[k]))) throw new Error('bad')
      if (!window.confirm(t('confirmImport'))) return
      s.importData(d as Data)
      window.alert(t('importOk'))
    } catch { window.alert(t('importFail')) }
  }
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<><Cog size={15} />{t('settings')}</>} />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-xl space-y-4">
          <section className="card flex items-center justify-between p-4">
            <div className="text-sm font-medium">{t('language')}</div>
            <div className="flex overflow-hidden rounded-md border border-line">
              <button type="button" className={seg(s.lang === 'id')} aria-pressed={s.lang === 'id'} onClick={() => s.setLang('id')}>Bahasa Indonesia</button>
              <button type="button" className={seg(s.lang === 'en')} aria-pressed={s.lang === 'en'} onClick={() => s.setLang('en')}>English</button>
            </div>
          </section>
          <section className="card flex items-center justify-between p-4">
            <div className="text-sm font-medium">{t('theme')}</div>
            <div className="flex overflow-hidden rounded-md border border-line">
              <button type="button" className={seg(s.theme === 'dark')} aria-pressed={s.theme === 'dark'} onClick={() => s.setTheme('dark')}>{t('dark')}</button>
              <button type="button" className={seg(s.theme === 'light')} aria-pressed={s.theme === 'light'} onClick={() => s.setTheme('light')}>{t('light')}</button>
            </div>
          </section>
          {install && (
            <section className="card flex items-center justify-between gap-3 p-4">
              <div><div className="text-sm font-medium">{t('install')}</div><p className="text-[13px] text-muted">{t('installHint')}</p></div>
              <button type="button" className="btn-primary" onClick={install}><Download size={14} />{t('install')}</button>
            </section>
          )}
          <section className="card space-y-3 p-4">
            <div><div className="text-sm font-medium">{t('data')}</div><p className="text-[13px] text-muted">{t('dataHint')}</p></div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={doExport}><Download size={14} />{t('exportData')}</button>
              <button type="button" className="btn" onClick={() => file.current?.click()}><Upload size={14} />{t('importData')}</button>
              <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = '' }} />
              <button type="button" className="btn !text-danger" onClick={() => window.confirm(t('confirmReset')) && s.resetData()}><Trash2 size={14} />{t('resetData')}</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
