import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

// Animated knowledge graph background nodes/edges
const GRAPH_NODES = [
  { x: 15, y: 20, label: 'OOP', r: 18 },
  { x: 40, y: 12, label: 'API', r: 14 },
  { x: 65, y: 22, label: 'Graph', r: 20 },
  { x: 82, y: 40, label: 'DFS', r: 14 },
  { x: 72, y: 62, label: 'BFS', r: 14 },
  { x: 50, y: 72, label: 'DP', r: 18 },
  { x: 25, y: 65, label: 'Stack', r: 14 },
  { x: 10, y: 45, label: 'Tree', r: 16 },
  { x: 35, y: 42, label: 'Hash', r: 16 },
  { x: 60, y: 48, label: 'Sort', r: 16 },
  { x: 20, y: 85, label: 'Queue', r: 13 },
  { x: 75, y: 82, label: 'Heap', r: 13 },
  { x: 88, y: 18, label: 'Array', r: 13 },
]
const GRAPH_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 4],
  [0, 7], [1, 8], [2, 9], [5, 10], [4, 11],
  [2, 12], [8, 5], [6, 10], [9, 11],
]

function KnowledgeGraphBg() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2200)
    return () => clearInterval(id)
  }, [])

  const activeEdge = tick % GRAPH_EDGES.length
  const activeNode = GRAPH_EDGES[activeEdge]

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
          <stop offset="50%" stopColor="#93c5fd" stopOpacity="1" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Static edges */}
      {GRAPH_EDGES.map(([a, b], i) => {
        const na = GRAPH_NODES[a], nb = GRAPH_NODES[b]
        const isActive = i === activeEdge
        return (
          <line
            key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={isActive ? '#93c5fd' : '#1e40af'}
            strokeWidth={isActive ? 0.6 : 0.3}
            strokeOpacity={isActive ? 0.9 : 0.4}
            style={{ transition: 'all 0.5s ease' }}
          />
        )
      })}

      {/* Nodes */}
      {GRAPH_NODES.map((node, i) => {
        const isActive = activeNode && (i === activeNode[0] || i === activeNode[1])
        return (
          <g key={i}>
            <circle
              cx={node.x} cy={node.y} r={node.r * 0.55}
              fill={isActive ? '#3b82f6' : '#1d4ed8'}
              fillOpacity={isActive ? 0.9 : 0.5}
              stroke={isActive ? '#93c5fd' : '#3b82f6'}
              strokeWidth={isActive ? 0.5 : 0.3}
              filter={isActive ? 'url(#glow)' : undefined}
              style={{ transition: 'all 0.5s ease' }}
            />
            <text
              x={node.x} y={node.y + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={node.r * 0.25}
              fill={isActive ? '#bfdbfe' : '#93c5fd'}
              fillOpacity={isActive ? 1 : 0.7}
              fontFamily="sans-serif"
              fontWeight="600"
              style={{ transition: 'all 0.5s ease' }}
            >
              {node.label}
            </text>
          </g>
        )
      })}

      {/* Pulse on active nodes */}
      {activeNode && activeNode.map(idx => {
        const n = GRAPH_NODES[idx]
        return (
          <circle
            key={`pulse-${idx}-${tick}`}
            cx={n.x} cy={n.y} r={n.r * 0.55}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="0.4"
            style={{
              animation: 'ripple 1.8s ease-out forwards',
            }}
          />
        )
      })}

      <style>{`
        @keyframes ripple {
          0% { r: ${GRAPH_NODES[0].r * 0.55}px; stroke-opacity: 0.8; }
          100% { r: ${GRAPH_NODES[0].r * 1.8}px; stroke-opacity: 0; }
        }
      `}</style>
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || '이메일 또는 비밀번호를 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: Knowledge Graph Visual ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)' }}>

        <KnowledgeGraphBg />

        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.15) 0%, transparent 70%)'
        }} />

        {/* Top logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            {/* KoreaIT Academy Logo */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="6" r="2.5" fill="white" />
                <circle cx="4" cy="17" r="2.5" fill="white" />
                <circle cx="18" cy="17" r="2.5" fill="white" />
                <line x1="11" y1="6" x2="4" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="11" y1="6" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="4" y1="17" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">KoreaIT Academy</div>
              <div className="text-blue-300 text-xs font-medium tracking-widest uppercase">Re:Node Platform</div>
            </div>
          </div>
        </div>

        {/* Center tagline */}
        <div className="relative z-10 px-10 pb-4">
          {/* RE:Node brand title */}
          <div className="mb-5 flex items-baseline gap-1">
            <span
              className="font-black tracking-tight"
              style={{
                fontSize: '2.6rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 60%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              RE
            </span>
            <span
              style={{
                fontSize: '2.6rem',
                fontWeight: 900,
                color: '#60a5fa',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              :
            </span>
            <span
              className="font-black tracking-tight"
              style={{
                fontSize: '2.6rem',
                background: 'linear-gradient(135deg, #93c5fd 0%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              Node
            </span>
            {/* Decorative underline */}
            <div className="ml-2 mb-1 flex items-center gap-1 self-end">
              <div className="h-0.5 w-6 rounded-full" style={{ background: '#60a5fa', opacity: 0.7 }} />
              <div className="h-0.5 w-3 rounded-full" style={{ background: '#93c5fd', opacity: 0.4 }} />
              <div className="h-0.5 w-1.5 rounded-full" style={{ background: '#bfdbfe', opacity: 0.3 }} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            지식을 연결하고<br />
            <span style={{ color: '#93c5fd' }}>개념을 그래프로</span> 시각화
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-6">
            AI가 강의 내용을 분석하여 지식 그래프를 생성하고,<br />
            나에게 맞는 복습 과제를 자동으로 생성합니다.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['지식 그래프 시각화', 'AI 과제 생성', '개인화 복습', '학습 추적'].map(f => (
              <span key={f}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 px-10 pb-10 flex gap-8">
          {[['35+', '강의 개념 노드'], ['AI', '자동 그래프 생성'], ['100%', '맞춤형 복습']].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-blue-300 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: '#f0f7ff' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="6" r="2.5" fill="white" />
                <circle cx="4" cy="17" r="2.5" fill="white" />
                <circle cx="18" cy="17" r="2.5" fill="white" />
                <line x1="11" y1="6" x2="4" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="11" y1="6" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="4" y1="17" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">KoreaIT Academy</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>안녕하세요!</h1>
            <p className="text-sm" style={{ color: '#64748b' }}>Re:Node에 로그인하여 학습을 시작하세요</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.5a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                이메일
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="example@koreaIT.ac.kr"
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                style={{
                  border: '1.5px solid #e2e8f0',
                  background: 'white',
                  color: '#0f172a',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                비밀번호
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                style={{
                  border: '1.5px solid #e2e8f0',
                  background: 'white',
                  color: '#0f172a',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(59,130,246,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: '#3b82f6' }}>
                회원가입
              </Link>
            </p>
          </div>

          {/* Knowledge graph hint */}
          <div className="mt-8 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="5" r="2" fill="white" />
                <circle cx="4" cy="17" r="2" fill="white" />
                <circle cx="18" cy="17" r="2" fill="white" />
                <line x1="11" y1="5" x2="4" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="11" y1="5" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
                <line x1="4" y1="17" x2="18" y2="17" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#1e40af' }}>지식 그래프 기반 학습</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#3b82f6' }}>
                강의 내 개념들의 연결 관계를 그래프로 탐색하고, AI가 생성한 맞춤형 과제로 복습하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
