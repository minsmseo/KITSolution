import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function AppLayout({ children, title }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={drawerOpen} onMobileClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="5" r="2.5" fill="white" />
                <circle cx="4" cy="17" r="2.5" fill="white" />
                <circle cx="18" cy="17" r="2.5" fill="white" />
                <line x1="11" y1="5" x2="4" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="11" y1="5" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="4" y1="17" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-sm">ReNode</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 text-xs font-bold">
                {user?.name?.[0] || 'U'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            {title && (
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">{title}</h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
