import { useEffect, useState } from 'react'
import AppLayout from '../components/Layout/AppLayout'
import { adminAPI } from '../services/api'
import { AnalyticsContent } from './Analytics'
import {
  Shield, Users, BookOpen, BarChart3,
  Plus, Trash2, UserCog, X, ChevronDown, AlertCircle,
} from 'lucide-react'

const ROLES = ['admin', 'instructor', 'student', 'manager']
const ROLE_COLORS = {
  admin:      'bg-red-100 text-red-700',
  instructor: 'bg-blue-100 text-blue-700',
  student:    'bg-emerald-100 text-emerald-700',
  manager:    'bg-violet-100 text-violet-700',
}
const ROLE_LABELS = { admin: '관리자', instructor: '강사', student: '학생', manager: '매니저' }

const STATUS_COLORS = {
  completed:  'bg-emerald-100 text-emerald-700',
  processing: 'bg-amber-100 text-amber-700',
  pending:    'bg-slate-100 text-slate-500',
  failed:     'bg-red-100 text-red-700',
}

// ── 공통 모달 ──────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'
const selectCls = `${inputCls} bg-white`
const btnPrimary = 'w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50'
const btnDanger = 'px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors'
const btnSecondary = 'px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors'

// ── 사용자 생성 모달 ───────────────────────────────────────

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return setErr('모든 항목을 입력하세요')
    setLoading(true); setErr('')
    try {
      const res = await adminAPI.createUser(form)
      onCreated(res.data)
      onClose()
    } catch (e) {
      setErr(e.response?.data?.detail || '생성 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="새 사용자 추가" onClose={onClose}>
      <div className="space-y-4">
        <Field label="이름">
          <input className={inputCls} value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="홍길동" />
        </Field>
        <Field label="이메일">
          <input className={inputCls} type="email" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@renode.io" />
        </Field>
        <Field label="비밀번호">
          <input className={inputCls} type="password" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
        </Field>
        <Field label="역할">
          <select className={selectCls} value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </Field>
        {err && <p className="text-xs text-red-500">{err}</p>}
        <button className={btnPrimary} onClick={submit} disabled={loading}>
          {loading ? '추가 중...' : '사용자 추가'}
        </button>
      </div>
    </Modal>
  )
}

// ── 강의 생성 모달 ─────────────────────────────────────────

function CreateLectureModal({ instructors, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', instructor_id: instructors[0]?.id || '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!form.title || !form.instructor_id) return setErr('강의명과 강사를 선택하세요')
    setLoading(true); setErr('')
    try {
      const res = await adminAPI.createLecture({
        title: form.title,
        description: form.description || null,
        instructor_id: form.instructor_id,
      })
      onCreated(res.data)
      onClose()
    } catch (e) {
      setErr(e.response?.data?.detail || '생성 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="새 강의 추가" onClose={onClose}>
      <div className="space-y-4">
        <Field label="강의명">
          <input className={inputCls} value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="강의 제목 입력" />
        </Field>
        <Field label="설명 (선택)">
          <textarea className={`${inputCls} resize-none`} rows={3} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="강의 설명" />
        </Field>
        <Field label="담당 강사">
          <select className={selectCls} value={form.instructor_id}
            onChange={e => setForm(p => ({ ...p, instructor_id: e.target.value }))}>
            <option value="">강사 선택</option>
            {instructors.map(i => (
              <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
            ))}
          </select>
        </Field>
        {err && <p className="text-xs text-red-500">{err}</p>}
        <button className={btnPrimary} onClick={submit} disabled={loading}>
          {loading ? '추가 중...' : '강의 추가'}
        </button>
      </div>
    </Modal>
  )
}

// ── 강사 재배정 모달 ───────────────────────────────────────

function ReassignModal({ lecture, instructors, onClose, onReassigned }) {
  const [instructorId, setInstructorId] = useState(lecture.instructor_id || '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!instructorId) return setErr('강사를 선택하세요')
    setLoading(true); setErr('')
    try {
      await adminAPI.reassignInstructor(lecture.id, instructorId)
      const inst = instructors.find(i => i.id === instructorId)
      onReassigned(lecture.id, instructorId, inst?.name || '')
      onClose()
    } catch (e) {
      setErr(e.response?.data?.detail || '재배정 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="강사 재배정" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">{lecture.title}</span> 강의의 담당 강사를 변경합니다
        </p>
        <Field label="새 담당 강사">
          <select className={selectCls} value={instructorId}
            onChange={e => setInstructorId(e.target.value)}>
            <option value="">강사 선택</option>
            {instructors.map(i => (
              <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
            ))}
          </select>
        </Field>
        {err && <p className="text-xs text-red-500">{err}</p>}
        <button className={btnPrimary} onClick={submit} disabled={loading}>
          {loading ? '처리 중...' : '재배정'}
        </button>
      </div>
    </Modal>
  )
}

// ── 탭: 사용자 관리 ────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [changingRole, setChangingRole] = useState({})   // userId -> bool
  const [deleting, setDeleting] = useState({})

  const load = (role = filter) => {
    setLoading(true)
    adminAPI.listUsers(role)
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFilter = (role) => {
    setFilter(role)
    load(role)
  }

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(p => ({ ...p, [userId]: true }))
    try {
      const res = await adminAPI.changeRole(userId, newRole)
      setUsers(p => p.map(u => u.id === userId ? { ...u, role: res.data.role } : u))
    } catch (e) {
      alert(e.response?.data?.detail || '역할 변경 실패')
    } finally {
      setChangingRole(p => ({ ...p, [userId]: false }))
    }
  }

  const handleDelete = async (user) => {
    if (!confirm(`"${user.name}" 계정을 삭제하시겠습니까?\n관련 제출 및 수강 정보도 모두 삭제됩니다.`)) return
    setDeleting(p => ({ ...p, [user.id]: true }))
    try {
      await adminAPI.deleteUser(user.id)
      setUsers(p => p.filter(u => u.id !== user.id))
    } catch (e) {
      alert(e.response?.data?.detail || '삭제 실패')
    } finally {
      setDeleting(p => ({ ...p, [user.id]: false }))
    }
  }

  const counts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {})

  return (
    <div>
      {/* 상단 바 */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[['all', '전체'], ...ROLES.map(r => [r, ROLE_LABELS[r]])].map(([val, label]) => (
            <button key={val}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === val ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => handleFilter(val)}>
              {label}
              {val !== 'all' && <span className="ml-1 text-slate-400">({counts[val] ?? 0})</span>}
            </button>
          ))}
        </div>
        <button
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          onClick={() => setShowCreate(true)}>
          <Plus size={15} /> 사용자 추가
        </button>
      </div>

      {/* 테이블 */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">로딩 중...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">사용자가 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">이름</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">이메일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">역할</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">가입일</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ROLE_COLORS[u.role]}`}>
                          {u.name[0]}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                        <select
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          value={u.role}
                          disabled={changingRole[u.id]}
                          onChange={e => handleRoleChange(u.id, e.target.value)}>
                          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                        <ChevronDown size={11} className="text-slate-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className={btnDanger}
                        disabled={deleting[u.id]}
                        onClick={() => handleDelete(u)}>
                        {deleting[u.id] ? '삭제 중...' : <Trash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(user) => setUsers(p => [user, ...p])}
        />
      )}
    </div>
  )
}

// ── 탭: 강의 관리 ──────────────────────────────────────────

function LecturesTab({ instructors }) {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [reassignTarget, setReassignTarget] = useState(null)
  const [deleting, setDeleting] = useState({})

  useEffect(() => {
    adminAPI.listLectures()
      .then(r => setLectures(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (lecture) => {
    if (!confirm(`"${lecture.title}" 강의를 삭제하시겠습니까?\n수강생 정보 및 과제 데이터도 모두 삭제됩니다.`)) return
    setDeleting(p => ({ ...p, [lecture.id]: true }))
    try {
      await adminAPI.deleteLecture(lecture.id)
      setLectures(p => p.filter(l => l.id !== lecture.id))
    } catch (e) {
      alert(e.response?.data?.detail || '삭제 실패')
    } finally {
      setDeleting(p => ({ ...p, [lecture.id]: false }))
    }
  }

  const handleReassigned = (lectureId, instructorId, instructorName) => {
    setLectures(p => p.map(l =>
      l.id === lectureId
        ? { ...l, instructor_id: instructorId, instructor_name: instructorName }
        : l
    ))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">총 {lectures.length}개 강의</p>
        <button
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          onClick={() => setShowCreate(true)}>
          <Plus size={15} /> 강의 추가
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">로딩 중...</div>
        ) : lectures.length === 0 ? (
          <div className="p-12 text-center text-slate-400">강의가 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">강의명</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">담당 강사</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">생성일</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lectures.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 max-w-xs truncate">{l.title}</p>
                      {l.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{l.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{l.instructor_name}</p>
                      <p className="text-xs text-slate-400">{l.instructor_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[l.graph_status] || 'bg-slate-100 text-slate-500'}`}>
                        {l.graph_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(l.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button className={btnSecondary} onClick={() => setReassignTarget(l)}>
                          <UserCog size={13} className="inline mr-1" />재배정
                        </button>
                        <button className={btnDanger} disabled={deleting[l.id]} onClick={() => handleDelete(l)}>
                          {deleting[l.id] ? '...' : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateLectureModal
          instructors={instructors}
          onClose={() => setShowCreate(false)}
          onCreated={(lec) => setLectures(p => [lec, ...p])}
        />
      )}
      {reassignTarget && (
        <ReassignModal
          lecture={reassignTarget}
          instructors={instructors}
          onClose={() => setReassignTarget(null)}
          onReassigned={handleReassigned}
        />
      )}
    </div>
  )
}

// ── 메인: AdminDashboard ───────────────────────────────────

const TABS = [
  { id: 'users',     label: '사용자 관리', icon: Users },
  { id: 'lectures',  label: '강의 관리',   icon: BookOpen },
  { id: 'analytics', label: '분석',        icon: BarChart3 },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('users')
  const [instructors, setInstructors] = useState([])

  // 강의 생성/재배정에서 사용할 강사 목록 미리 로드
  useEffect(() => {
    adminAPI.listUsers('instructor').then(r => setInstructors(r.data)).catch(() => {})
  }, [])

  return (
    <AppLayout title="관리자 대시보드">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <Shield size={20} className="text-red-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">관리자 대시보드</h1>
          <p className="text-sm text-slate-500">사용자 및 강의 관리, 분석 조회</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab(id)}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {tab === 'users'     && <UsersTab />}
      {tab === 'lectures'  && <LecturesTab instructors={instructors} />}
      {tab === 'analytics' && <AnalyticsContent />}
    </AppLayout>
  )
}
