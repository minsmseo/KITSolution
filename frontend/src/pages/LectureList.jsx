import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import AppLayout from '../components/Layout/AppLayout'
import { lectureAPI } from '../services/api'
import { Search, BookOpen, Network } from 'lucide-react'

export default function LectureList() {
  const { user } = useAuth()
  const [lectures, setLectures] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    lectureAPI.list()
      .then((res) => setLectures(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = lectures.filter(
    (l) => l.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout title="강의 목록">
      <div className="mb-4 md:mb-6 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="input pl-9"
          placeholder="강의 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">로딩 중...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 md:p-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">강의를 찾을 수 없습니다</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((lecture) => (
            <Link
              key={lecture.id}
              to={`/lectures/${lecture.id}`}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: '#eff6ff' }}>
                <Network size={16} style={{ color: '#2563eb' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm md:text-base truncate">{lecture.title}</p>
                {lecture.description && (
                  <p className="text-xs md:text-sm text-slate-500 truncate">{lecture.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <GraphStatusBadge status={lecture.graph_status} />
                <span className="text-xs text-slate-400 hidden sm:block">
                  {new Date(lecture.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
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
  const label = { pending: '대기', processing: '처리중', completed: '완료', failed: '실패' }
  return <span className={`badge ${config[status] || config.pending} text-xs`}>{label[status] || status}</span>
}
