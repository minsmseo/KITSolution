import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/Layout/AppLayout'
import { lectureAPI } from '../services/api'
import { BookOpen, Network, FileText, BarChart3, ArrowRight } from 'lucide-react'

const ROLE_DESCRIPTION = {
  instructor: 'Upload lecture materials and generate knowledge graphs for your students.',
  student: 'Select concepts to review and generate personalized assignments.',
  manager: 'Monitor participation rates and track student engagement.',
  admin: 'Full platform access — manage users, lectures, and settings.',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    lectureAPI.list()
      .then((res) => setLectures(res.data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Lectures', value: lectures.length, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Knowledge Graphs', value: lectures.filter(l => l.graph_status === 'completed').length, icon: Network, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Graphs', value: lectures.filter(l => l.graph_status === 'processing' || l.graph_status === 'pending').length, icon: FileText, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <AppLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
        <p className="mt-1 text-indigo-200 text-sm">{ROLE_DESCRIPTION[user?.role]}</p>
        <div className="mt-4 flex gap-3">
          <Link to="/my-classes" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
            My Classes <ArrowRight size={16} />
          </Link>
          {user?.role === 'manager' && (
            <Link to="/analytics" className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-400 transition-colors">
              View Analytics <BarChart3 size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Lectures */}
      <div className="card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Lectures</h2>
          <Link to="/lectures" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : lectures.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p>No lectures yet</p>
            </div>
          ) : (
            lectures.map((lecture) => (
              <Link
                key={lecture.id}
                to={`/lectures/${lecture.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-800">{lecture.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(lecture.created_at).toLocaleDateString()}
                  </p>
                </div>
                <GraphStatusBadge status={lecture.graph_status} />
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function GraphStatusBadge({ status }) {
  const config = {
    pending: 'bg-slate-100 text-slate-600',
    processing: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`badge ${config[status] || config.pending} capitalize`}>{status}</span>
  )
}
