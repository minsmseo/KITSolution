import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import {
  LayoutDashboard, BookOpen, Library, BarChart3, Shield, LogOut, Network, X,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',  label: '대시보드',   icon: LayoutDashboard, roles: ['admin', 'instructor', 'student', 'manager'] },
  { to: '/my-classes', label: '내 강의',    icon: BookOpen,        roles: ['admin', 'instructor', 'student', 'manager'] },
  { to: '/lectures',   label: '강의 목록',  icon: Library,         roles: ['admin', 'instructor', 'student', 'manager'] },
  { to: '/analytics',  label: '분석',       icon: BarChart3,       roles: ['admin', 'manager'] },
  { to: '/admin',      label: '관리자',     icon: Shield,          roles: ['admin'] },
]

// Shared inner content for both desktop and mobile drawer
function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role))

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="5" r="2.5" fill="white" />
              <circle cx="4" cy="17" r="2.5" fill="white" />
              <circle cx="18" cy="17" r="2.5" fill="white" />
              <line x1="11" y1="5" x2="4" y2="17" stroke="white" strokeWidth="1.5" />
              <line x1="11" y1="5" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
              <line x1="4" y1="17" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight leading-none">ReNode</span>
            <p className="text-blue-400 text-xs">KoreaIT Academy</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-800">
        <div className="mb-3">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700 text-blue-300 text-xs rounded-full capitalize">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  )
}

// Mobile drawer with swipe-to-close
function MobileDrawer({ open, onClose }) {
  const drawerRef = useRef(null)
  const startXRef = useRef(null)
  const currentXRef = useRef(0)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    isDraggingRef.current = true
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    if (dx < 0) {
      currentXRef.current = dx
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateX(${dx}px)`
        drawerRef.current.style.transition = 'none'
      }
    }
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
    if (currentXRef.current < -60) {
      onClose()
    } else if (drawerRef.current) {
      drawerRef.current.style.transform = 'translateX(0)'
      drawerRef.current.style.transition = 'transform 0.3s ease'
    }
    currentXRef.current = 0
    startXRef.current = null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black transition-opacity duration-300 lg:hidden',
          open ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={clsx(
          'fixed top-0 left-0 h-full w-72 z-50 bg-slate-900 lg:hidden',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ willChange: 'transform' }}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}

// Desktop sidebar (always visible on lg+)
function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-60 min-h-screen bg-slate-900 flex-col flex-shrink-0">
      <SidebarContent />
    </aside>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      <DesktopSidebar />
      <MobileDrawer open={mobileOpen} onClose={onMobileClose} />
    </>
  )
}
