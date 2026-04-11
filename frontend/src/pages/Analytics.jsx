import { useEffect, useState } from 'react'
import AppLayout from '../components/Layout/AppLayout'
import { analyticsAPI } from '../services/api'
import {
  BarChart3, Users, TrendingUp, BookOpen,
  ChevronDown, ChevronRight, UserCheck, FileText, Send, Clock,
  Activity, AlertCircle,
} from 'lucide-react'

const LEVEL_CONFIG = {
  high:   { label: '높음',   color: 'text-emerald-600', bg: 'bg-emerald-50',  bar: '#10b981' },
  medium: { label: '보통',   color: 'text-blue-600',    bg: 'bg-blue-50',     bar: '#3b82f6' },
  low:    { label: '낮음',   color: 'text-amber-600',   bg: 'bg-amber-50',    bar: '#f59e0b' },
  none:   { label: '미참여', color: 'text-slate-400',   bg: 'bg-slate-100',   bar: '#e2e8f0' },
}

// ── 공유 서브컴포넌트 ─────────────────────────────────────

export function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-4 md:p-5">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-2 md:mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-xl md:text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs md:text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function ParticipationBadge({ rate }) {
  const pct = (rate * 100).toFixed(0)
  const color = rate >= 0.7 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : rate >= 0.4 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {pct}%
    </span>
  )
}

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000 / 60)
  if (diff < 60) return `${diff}분 전`
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}시간 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function StudentEngagementTable({ data }) {
  if (!data || !data.students?.length) {
    return <p className="text-xs text-slate-400 py-2">수강생이 없습니다</p>
  }
  const order = { high: 0, medium: 1, low: 2, none: 3 }
  const sorted = [...data.students].sort((a, b) => order[a.engagement_level] - order[b.engagement_level])
  const maxGen = Math.max(...sorted.map(s => s.assignments_generated), 1)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Activity size={13} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">학생별 참여 현황</span>
        <span className="text-xs text-slate-400">({data.total_students}명)</span>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => {
          const count = sorted.filter(s => s.engagement_level === level).length
          return (
            <div key={level} className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${cfg.bg}`}>
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.bar }} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label} {count}명</span>
            </div>
          )
        })}
      </div>
      <div className="space-y-2">
        {sorted.map((student) => {
          const cfg = LEVEL_CONFIG[student.engagement_level]
          const barWidth = Math.min((student.assignments_generated / maxGen) * 100, 100)
          return (
            <div key={student.student_id}
              className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}>
                  <span className={`text-xs font-bold ${cfg.color}`}>{student.student_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{student.student_name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate hidden sm:block">{student.student_email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <FileText size={12} className="text-blue-400" /><span>{student.assignments_generated}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Send size={12} className="text-emerald-400" /><span>{student.submissions}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, background: cfg.bar }} />
                </div>
                {student.last_activity ? (
                  <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                    <Clock size={11} /><span className="text-xs">{formatDate(student.last_activity)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 flex-shrink-0">활동 없음</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><FileText size={11} /> 과제 생성 수</span>
        <span className="flex items-center gap-1"><Send size={11} /> 제출 수</span>
      </div>
    </div>
  )
}

// ── 분석 콘텐츠 (AdminDashboard에서도 재사용) ─────────────

export function AnalyticsContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedInstructor, setExpandedInstructor] = useState({})
  const [expandedLecture, setExpandedLecture] = useState({})
  const [studentData, setStudentData] = useState({})
  const [loadingStudents, setLoadingStudents] = useState({})

  useEffect(() => {
    analyticsAPI.allInstructors()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.status || 'error'))
      .finally(() => setLoading(false))
  }, [])

  const toggleInstructor = (id) =>
    setExpandedInstructor((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleLecture = async (lectureId) => {
    const next = !expandedLecture[lectureId]
    setExpandedLecture((prev) => ({ ...prev, [lectureId]: next }))
    if (next && !studentData[lectureId]) {
      setLoadingStudents((prev) => ({ ...prev, [lectureId]: true }))
      try {
        const res = await analyticsAPI.lectureStudents(lectureId)
        setStudentData((prev) => ({ ...prev, [lectureId]: res.data }))
      } catch {
        setStudentData((prev) => ({ ...prev, [lectureId]: null }))
      } finally {
        setLoadingStudents((prev) => ({ ...prev, [lectureId]: false }))
      }
    }
  }

  if (loading) return <div className="text-center py-16 text-slate-400">로딩 중...</div>

  if (error) return (
    <div className="card p-8 text-center text-red-500">
      <AlertCircle size={36} className="mx-auto mb-3 opacity-60" />
      <p className="font-semibold">데이터를 불러오지 못했습니다</p>
      <p className="text-sm text-slate-400 mt-1">
        {error === 404 ? 'API 엔드포인트를 찾을 수 없습니다' :
         error === 403 ? '접근 권한이 없습니다' : `서버 오류 (${error})`}
      </p>
    </div>
  )

  const instructors = data?.instructors || []
  const totalStudents = data?.total_distinct_students ?? 0
  const totalParticipating = data?.total_participating_students ?? 0
  const overallRate = totalStudents > 0 ? (totalParticipating / totalStudents * 100).toFixed(1) : '0.0'

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <SummaryCard label="강사 수" value={instructors.length} icon={Users} color="text-blue-600 bg-blue-50" />
        <SummaryCard label="전체 학생" value={totalStudents} icon={UserCheck} color="text-cyan-600 bg-cyan-50" />
        <SummaryCard label="참여 학생" value={totalParticipating} icon={TrendingUp} color="text-emerald-600 bg-emerald-50" />
        <SummaryCard label="전체 참여율" value={`${overallRate}%`} icon={BarChart3} color="text-violet-600 bg-violet-50" />
      </div>

      {instructors.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p>분석 데이터가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {instructors.map((instructor) => (
            <div key={instructor.instructor_id} className="card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                onClick={() => toggleInstructor(instructor.instructor_id)}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 text-sm font-bold">{instructor.instructor_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{instructor.instructor_name}</p>
                  <p className="text-xs text-slate-500 truncate hidden sm:block">{instructor.instructor_email}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm flex-shrink-0">
                  <Metric label="강의" value={instructor.lectures.length} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {expandedInstructor[instructor.instructor_id]
                    ? <ChevronDown size={16} className="text-slate-400" />
                    : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </button>

              {expandedInstructor[instructor.instructor_id] && (
                <div className="md:hidden flex gap-4 px-4 pb-2 text-xs text-slate-500">
                  <span>강의 {instructor.lectures.length}개</span>
                </div>
              )}

              {expandedInstructor[instructor.instructor_id] && instructor.lectures.length > 0 && (
                <div className="border-t border-slate-100">
                  {instructor.lectures.map((lec) => (
                    <div key={lec.lecture_id} className="border-b border-slate-50 last:border-b-0">
                      <button
                        className="w-full flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-slate-50 transition-colors text-left bg-slate-50/50"
                        onClick={() => toggleLecture(lec.lecture_id)}
                      >
                        <BookOpen size={15} className="text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{lec.lecture_title}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                            <span>학생 {lec.total_students}명</span>
                            <span>과제 {lec.total_assignments_generated}건</span>
                            <span>제출 {lec.total_submissions}건</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ParticipationBadge rate={lec.participation_rate} />
                          {expandedLecture[lec.lecture_id]
                            ? <ChevronDown size={14} className="text-slate-400" />
                            : <ChevronRight size={14} className="text-slate-400" />}
                        </div>
                      </button>
                      {expandedLecture[lec.lecture_id] && (
                        <div className="bg-white px-4 md:px-8 py-3">
                          {loadingStudents[lec.lecture_id] ? (
                            <p className="text-xs text-slate-400 py-2">학생 데이터 로딩 중...</p>
                          ) : studentData[lec.lecture_id] === null ? (
                            <p className="text-xs text-red-400 py-2 flex items-center gap-1">
                              <AlertCircle size={12} /> 데이터를 불러올 수 없습니다
                            </p>
                          ) : (
                            <StudentEngagementTable data={studentData[lec.lecture_id]} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 분석 페이지 ───────────────────────────────────────────

export default function Analytics() {
  return (
    <AppLayout title="학습 참여 분석">
      <AnalyticsContent />
    </AppLayout>
  )
}
