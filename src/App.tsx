import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { CreateItemModal, ItemPeek } from './components/ItemPeek'
import { InstallBanner } from './components/Install'
import { Home } from './pages/Home'
import { Stickies } from './pages/Stickies'
import { Projects } from './pages/Projects'
import { Settings } from './pages/Settings'
import { Analytics, CycleDetail, Cycles, ModuleDetail, Modules, ProjectItems, ProjectPages, ViewDetail, Views } from './pages/ProjectPages'

export default function App() {
  const theme = useStore((s) => s.theme)
  const lang = useStore((s) => s.lang)
  const setPeek = useStore((s) => s.setPeek)
  const [nav, setNav] = useState(false)
  const loc = useLocation()
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#0f1115' : '#f4f5f7')
  }, [theme])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  // Pindah halaman menutup panel detail, kecuali navigasi itu memang meminta sebuah item dibuka (mis. dari pencarian).
  useEffect(() => { setNav(false); setPeek((loc.state as { peek?: string } | null)?.peek ?? null) }, [loc.pathname, loc.state, setPeek])

  return (
    <div className="flex h-full flex-col">
      <Topbar onMenu={() => setNav((n) => !n)} />
      <div className="flex min-h-0 flex-1 gap-2 px-2 pb-2">
        <Sidebar open={nav} onClose={() => setNav(false)} />
        <main className="min-w-0 flex-1 overflow-hidden rounded-lg border border-line bg-surface">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stickies" element={<Stickies />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/p/:pid/items" element={<ProjectItems />} />
            <Route path="/p/:pid/cycles" element={<Cycles />} />
            <Route path="/p/:pid/cycles/:cid" element={<CycleDetail />} />
            <Route path="/p/:pid/modules" element={<Modules />} />
            <Route path="/p/:pid/modules/:mid" element={<ModuleDetail />} />
            <Route path="/p/:pid/views" element={<Views />} />
            <Route path="/p/:pid/views/:vid" element={<ViewDetail />} />
            <Route path="/p/:pid/pages" element={<ProjectPages />} />
            <Route path="/p/:pid/pages/:pgid" element={<ProjectPages />} />
            <Route path="/p/:pid/analytics" element={<Analytics />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
      <ItemPeek />
      <CreateItemModal />
      <InstallBanner />
    </div>
  )
}
