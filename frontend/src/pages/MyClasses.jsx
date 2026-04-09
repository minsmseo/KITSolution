import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import AppLayout from '../components/Layout/AppLayout'
import { lectureAPI } from '../services/api'
import { BookOpen, Plus, Network, ChevronRight } from 'lucide-react'
import CreateLectureModal from '../components/Lecture/CreateLectureModal'

export default function MyClasses() {
  const { user } = useAuth()
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchLectures = () => {
    setLoading(true)
    lectureAPI.list()
      .then((res) => setLectures(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLectures() }, [])

  return (
    <AppLayout title="내 강의">
      {/* Header action */}
      {user?.role === 'instructor' && (
        <div className="flex justify-end mb-4 md:mb-6">
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> 새 강의
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">로딩 중...</div>
      ) : lectures.length === 0 ? (
        <div className="card p-10 md:p-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">강의가 없습니다</p>
          {user?.role === 'instructor' && (
            <p className="text-slate-400 text-sm mt-1">첫 번째 강의를 만들어 시작하세요.</p>
          )}
          {user?.role === 'student' && (
            <p className="text-slate-400 text-sm mt-1">강사에게 강의 등록을 요청하세요.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {lectures.map((lecture) => (
            <Link
              key={lecture.id}
              to={`/lectures/${lecture.id}`}
              className="card p-4 md:p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ background: '#eff6ff' }}>
                  <Network size={18} style={{ color: '#2563eb' }} />
                </div>
                <GraphStatusBadge status={lecture.graph_status} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 text-sm md:text-base">{lecture.title}</h3>
              {lecture.description && (
                <p className="text-xs md:text-sm text-slate-500 line-clamp-2 flex-1">{lecture.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(lecture.created_at).toLocaleDateString('ko-KR')}</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateLectureModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchLectures() }}
        />
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
