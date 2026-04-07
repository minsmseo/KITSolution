import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard, BookOpen, Library, BarChart3, Shield, LogOut, Network,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'instructor', 'student', 'manager'] },
  { to: '/my-classes', label: 'My Classes', icon: BookOpen, roles: ['admin', 'instructor', 'student', 'manager'] },
  { to: '/lectures', label: 'Lectures', icon: Library, roles: ['admin', 'instructor', 'student', 'manager'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
  { to: '/admin', label: 'Admin', icon: Shield, roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role))

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Network className="text-indigo-400" size={22} />
          <span className="text-white font-bold text-lg tracking-tight">RevMap</span>
        </div>
        <p className="text-slate-400 text-xs mt-1">Personalized Review</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
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
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700 text-indigo-300 text-xs rounded-full capitalize">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
