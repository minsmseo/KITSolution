import { useState } from 'react'
import { assignmentAPI } from '../../services/api'
import { Sparkles, Send, X } from 'lucide-react'

const ASSIGNMENT_TYPES = [
  { value: 'short_answer', label: 'Short Answer Questions' },
  { value: 'concept_explanation', label: 'Concept Explanation' },
  { value: 'compare_contrast', label: 'Compare & Contrast' },
  { value: 'summary', label: 'Summary Task' },
  { value: 'mini_quiz', label: 'Mini Quiz' },
]
const DIFFICULTIES = ['easy', 'medium', 'hard']

// ── 마법진 로딩 애니메이션 ────────────────────────────────
function MagicCircleLoader({ keywords }) {
  const outerDots = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * Math.PI / 180
    return { x: +(80 * Math.cos(a)).toFixed(2), y: +(80 * Math.sin(a)).toFixed(2) }
  })
  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * Math.PI / 180
    return `${+(56 * Math.cos(a)).toFixed(2)},${+(56 * Math.sin(a)).toFixed(2)}`
  }).join(' ')
  const triPts = Array.from({ length: 3 }, (_, i) => {
    const a = (i * 120 - 90) * Math.PI / 180
    return `${+(32 * Math.cos(a)).toFixed(2)},${+(32 * Math.sin(a)).toFixed(2)}`
  }).join(' ')
  const starPts = Array.from({ length: 5 }, (_, i) => {
    const outer = (i * 72 - 90) * Math.PI / 180
    const inner = ((i * 72 + 36) - 90) * Math.PI / 180
    const ox = +(44 * Math.cos(outer)).toFixed(2)
    const oy = +(44 * Math.sin(outer)).toFixed(2)
    const ix = +(22 * Math.cos(inner)).toFixed(2)
    const iy = +(22 * Math.sin(inner)).toFixed(2)
    return `${ox},${oy} ${ix},${iy}`
  }).join(' ')
  const radials = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30) * Math.PI / 180
    return { x: +(80 * Math.cos(a)).toFixed(2), y: +(80 * Math.sin(a)).toFixed(2) }
  })

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <svg width="210" height="210" viewBox="-105 -105 210 210" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* 배경 글로우 */}
        <circle r="90" fill="url(#glowGrad)">
          <animate attributeName="r" values="80;95;80" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3s" repeatCount="indefinite"/>
        </circle>

        {/* 방사선 */}
        {radials.map((p, i) => (
          <line key={i} x1="0" y1="0" x2={p.x} y2={p.y}
            stroke="#6366f1" strokeWidth="0.4" opacity="0.18"/>
        ))}

        {/* 외곽 링 + 점 — 시계방향 느리게 */}
        <g filter="url(#glow)">
          <circle r="80" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.55">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/>
          </circle>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/>
          {outerDots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="3.5" fill="#6366f1">
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite"/>
              <animate attributeName="r" values="2.5;4.5;2.5" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>

        {/* 육각형 링 — 반시계 */}
        <g opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="8s" repeatCount="indefinite"/>
          <circle r="60" fill="none" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="3 7"/>
          <polygon points={hexPts} fill="none" stroke="#818cf8" strokeWidth="1.2"/>
        </g>

        {/* 오각형 별 + 링 — 시계방향 중간속도 */}
        <g opacity="0.65">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/>
          <circle r="44" fill="none" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="4 3"/>
          <polygon points={starPts} fill="none" stroke="#a5b4fc" strokeWidth="1.5"/>
        </g>

        {/* 삼각형 — 반시계 빠르게 */}
        <g opacity="0.75" filter="url(#glow)">
          <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="3.5s" repeatCount="indefinite"/>
          <circle r="32" fill="none" stroke="#818cf8" strokeWidth="1.5"/>
          <polygon points={triPts} fill="none" stroke="#c7d2fe" strokeWidth="2"/>
        </g>

        {/* 이너 링 — 시계방향 빠르게 */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite"/>
          <circle r="16" fill="none" stroke="#6366f1" strokeWidth="2.5" opacity="0.9"/>
        </g>

        {/* 중심 글로우 퍼짐 */}
        <circle r="16" fill="none" stroke="#818cf8" strokeWidth="6" opacity="0">
          <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>

        {/* 중심 */}
        <circle r="9" fill="#4f46e5" filter="url(#glow)">
          <animate attributeName="r" values="7;11;7" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle r="3.5" fill="white" opacity="0.95"/>
      </svg>

      <div className="text-center space-y-1.5">
        <p className="text-indigo-600 font-bold text-sm tracking-wide">✨ AI가 과제를 생성하고 있어요</p>
        <p className="text-slate-400 text-xs">선택한 개념을 분석 중... 최대 30초 소요됩니다</p>
        {keywords?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-100">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── 메인 패널 ─────────────────────────────────────────────
export default function AssignmentPanel({ lectureId, selectedKeywords, onClearSelection }) {
  const [assignmentType, setAssignmentType] = useState('short_answer')
  const [difficulty, setDifficulty] = useState('medium')
  const [generatedAssignment, setGeneratedAssignment] = useState(null)
  const [answer, setAnswer] = useState('')
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (selectedKeywords.length === 0) return
    setError('')
    setGenerating(true)
    try {
      const res = await assignmentAPI.generate(lectureId, {
        selected_keywords: selectedKeywords,
        assignment_type: assignmentType,
        difficulty,
      })
      setGeneratedAssignment(res.data)
      setAnswer('')
      setSubmitted(false)
    } catch (err) {
      const status = err.response?.status
      if (status === 503 || status === 429 || !status) {
        setError('busy')
      } else {
        setError('fail')
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!answer.trim() || !generatedAssignment) return
    setError('')
    setSubmitting(true)
    try {
      await assignmentAPI.submit(generatedAssignment.id, answer)
      setSubmitted(true)
    } catch {
      setError('submit_fail')
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedKeywords.length === 0) {
    return (
      <div className="card p-6 text-center text-slate-400">
        <Sparkles size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Select keywords from the graph to generate a personalized assignment</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" /> Generate Assignment
        </h3>
      </div>

      {/* 마법진 로딩 오버레이 */}
      {generating ? (
        <MagicCircleLoader keywords={selectedKeywords} />
      ) : (
        <div className="p-4 space-y-4">
          {/* Selected keywords */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">SELECTED KEYWORDS</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedKeywords.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
                  {kw}
                  <button onClick={() => onClearSelection(kw)} className="hover:text-amber-600">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Assignment type */}
          <div>
            <label className="label">Assignment Type</label>
            <select className="input" value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}>
              {ASSIGNMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="label">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}>
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
          </div>

          {/* 에러 메시지 - 친화적 */}
          {error === 'busy' && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <span className="text-2xl leading-none">🤖</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Gemini가 잠시 바빠요!</p>
                <p className="text-xs text-amber-600 mt-0.5">AI 서버에 요청이 몰리고 있어요. 잠시 후 다시 시도해주세요.</p>
              </div>
            </div>
          )}
          {error === 'fail' && (
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-2xl leading-none">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">과제 생성에 실패했어요</p>
                <p className="text-xs text-slate-500 mt-0.5">다시 시도해 주세요.</p>
              </div>
            </div>
          )}
          {error === 'submit_fail' && (
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-2xl leading-none">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">제출에 실패했어요</p>
                <p className="text-xs text-slate-500 mt-0.5">다시 시도해 주세요.</p>
              </div>
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Generate Assignment
          </button>

          {/* Generated assignment */}
          {generatedAssignment && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Your Assignment</p>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {generatedAssignment.generated_text}
                </div>
              </div>

              {!submitted ? (
                <div>
                  <label className="label">Your Answer</label>
                  <textarea className="input resize-none" rows={6} value={answer}
                    onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..."/>
                  <button onClick={handleSubmit} disabled={submitting || !answer.trim()}
                    className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
                    <Send size={16} />
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <p className="text-emerald-700 font-medium">Answer submitted successfully!</p>
                  <p className="text-emerald-600 text-sm mt-1">Your participation has been recorded.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
