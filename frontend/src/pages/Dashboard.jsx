import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import AppLayout from '../components/Layout/AppLayout'
import { lectureAPI } from '../services/api'
import { BookOpen, Network, FileText, BarChart3, ArrowRight } from 'lucide-react'

const ROLE_DESCRIPTION = {
  instructor: '강의 자료를 업로드하고 학생을 위한 지식 그래프를 생성하세요.',
  student: '개념을 선택하고 맞춤형 복습 과제를 생성하세요.',
  manager: '학생 참여율을 모니터링하고 학습 현황을 추적하세요.',
  admin: '전체 플랫폼 관리 — 사용자, 강의, 설정을 관리합니다.',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [lectures, setLectures] = useState([])
  const [allLectures, setAllLectures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    lectureAPI.list()
      .then((res) => {
        setAllLectures(res.data)
        setLectures(res.data.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: '전체 강의', value: allLectures.length, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: '활성 그래프', value: allLectures.filter(l => l.graph_status === 'completed').length, icon: Network, color: 'text-emerald-600 bg-emerald-50' },
    { label: '처리 중', value: allLectures.filter(l => l.graph_status === 'processing' || l.graph_status === 'pending').length, icon: FileText, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <AppLayout>
      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 md:p-6 mb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
        <h1 className="text-lg md:text-2xl font-bold">안녕하세요, {user?.name} 님 👋</h1>
        <p className="mt-1 text-blue-200 text-sm">{ROLE_DESCRIPTION[user?.role]}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/my-classes"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-50 transition-colors">
            내 강의 <ArrowRight size={14} />
          </Link>
          {user?.role === 'manager' && (
            <Link to="/analytics"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-400 transition-colors">
              분석 보기 <BarChart3 size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3 md:p-5">
            <div className={`inline-flex p-1.5 md:p-2 rounded-lg ${color} mb-2 md:mb-3`}>
              <Icon size={16} className="md:w-5 md:h-5" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-900">{loading ? '—' : value}</p>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Lectures */}
      <div className="card">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm md:text-base">최근 강의</h2>
          <Link to="/lectures" className="text-xs md:text-sm text-blue-600 hover:underline">전체 보기</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">로딩 중...</div>
          ) : lectures.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p>강의가 없습니다</p>
            </div>
          ) : (
            lectures.map((lecture) => (
              <Link
                key={lecture.id}
                to={`/lectures/${lecture.id}`}
                className="flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-slate-800 text-sm truncate">{lecture.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(lecture.created_at).toLocaleDateString('ko-KR')}
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
  const label = { pending: '대기', processing: '처리중', completed: '완료', failed: '실패' }
  return (
    <span className={`badge ${config[status] || config.pending} whitespace-nowrap text-xs`}>
      {label[status] || status}
    </span>
  )
}
