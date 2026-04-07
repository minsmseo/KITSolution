import { useEffect, useState } from 'react'
import AppLayout from '../components/Layout/AppLayout'
import { authAPI, lectureAPI } from '../services/api'
import api from '../services/api'
import { Shield, Users, BookOpen, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/users').catch(() => ({ data: [] })),
      lectureAPI.list().catch(() => ({ data: [] })),
    ]).then(([usersRes, lecturesRes]) => {
      setUsers(usersRes.data)
      setLectures(lecturesRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const roleCount = (role) => users.filter((u) => u.role === role).length

  return (
    <AppLayout title="Admin Dashboard">
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={users.length} icon={Users} color="text-indigo-600 bg-indigo-50" />
        <StatCard label="Instructors" value={roleCount('instructor')} icon={Shield} color="text-cyan-600 bg-cyan-50" />
        <StatCard label="Students" value={roleCount('student')} icon={Activity} color="text-emerald-600 bg-emerald-50" />
        <StatCard label="Total Lectures" value={lectures.length} icon={BookOpen} color="text-violet-600 bg-violet-50" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Users table */}
        <div className="card">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">All Users</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No users found (admin endpoint not implemented)</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="badge bg-slate-100 text-slate-600 capitalize">{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lectures table */}
        <div className="card">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">All Lectures</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {lectures.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-medium text-slate-800">{l.title}</p>
                <span className={`badge capitalize ${
                  l.graph_status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  l.graph_status === 'processing' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{l.graph_status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
