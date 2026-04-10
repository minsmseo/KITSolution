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
  const R = 76, r = 44

  // 육각형 꼭짓점
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * Math.PI / 180
    return [+(R * Math.cos(a)).toFixed(1), +(R * Math.sin(a)).toFixed(1)]
  })
  // 삼각형 꼭짓점
  const tri = Array.from({ length: 3 }, (_, i) => {
    const a = (i * 120 - 90) * Math.PI / 180
    return [+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)]
  })

  const hexPts     = hex.map(p => p.join(',')).join(' ')
  const triPts     = tri.map(p => p.join(',')).join(' ')
  const hexPerim   = Math.round(6 * R)                        // 456
  const triPerim   = Math.round(3 * r * Math.sqrt(3))         // 229
  const outerPerim = Math.round(2 * Math.PI * (R + 12))       // 553
  const innerPerim = Math.round(2 * Math.PI * 22)             // 138

  // 타이밍 상수
  const BUILD  = 2.4   // 구성 완료 시점 (s)
  const ACCEL  = 4.5   // 가속 구간 길이 (s)
  const STEADY = BUILD + ACCEL  // 등속 시작 (s) = 6.9

  // 가속 keyframe: 등가속도 운동 → CW 1080°(3바퀴), CCW -720°(2바퀴) 종료
  // 종료값이 360의 배수 → spin 전환 시 위치 점프 없음
  const cwKf = [
    [0, 0], [11.1, 13], [22.2, 53], [33.3, 120],
    [44.4, 213], [55.6, 333], [66.7, 480],
    [77.8, 653], [88.9, 853], [100, 1080],
  ]
  const ccwKf = [
    [0, 0], [11.1, -9], [22.2, -36], [33.3, -80],
    [44.4, -142], [55.6, -222], [66.7, -320],
    [77.8, -435], [88.9, -568], [100, -720],
  ]
  const toKf = (pairs) => pairs.map(([p, d]) => `${p}% { transform: rotate(${d}deg); }`).join('\n          ')

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <style>{`
        @keyframes mc-fade    { to { opacity: 1; } }
        @keyframes mc-hex-draw {
          from { stroke-dashoffset: ${hexPerim}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mc-tri-draw {
          from { stroke-dashoffset: ${triPerim}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mc-ring-out {
          from { stroke-dashoffset: ${outerPerim}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mc-ring-in {
          from { stroke-dashoffset: ${innerPerim}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mc-accel-cw  { ${toKf(cwKf)}  }
        @keyframes mc-accel-ccw { ${toKf(ccwKf)} }
        @keyframes mc-spin-cw   { to { transform: rotate(360deg);  } }
        @keyframes mc-spin-ccw  { to { transform: rotate(-360deg); } }
        @keyframes mc-pulse {
          0%, 100% { transform: scale(0.85); }
          50%      { transform: scale(1.18); }
        }
      `}</style>

      <svg width="210" height="210" viewBox="-105 -105 210 210">
        <defs>
          <filter id="mc-glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* ── 외곽 그룹: 육각형 (시계방향) ── */}
        <g filter="url(#mc-glow)" style={{
          transformBox: 'view-box',
          transformOrigin: 'center',
          animation: `mc-accel-cw ${ACCEL}s linear ${BUILD}s,
                      mc-spin-cw 0.75s linear ${STEADY}s infinite`,
        }}>
          {/* 외곽 링 — 구성 마지막에 그려짐 */}
          <circle r={R + 12} fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.45"
            strokeDasharray={outerPerim} strokeDashoffset={outerPerim}
            style={{ animation: `mc-ring-out 1.1s ease-out 1.9s forwards` }}
          />
          {/* 육각형 변 — 꼭짓점 다 나온 후 이음 */}
          <polygon points={hexPts} fill="none" stroke="#6366f1" strokeWidth="1.8"
            strokeDasharray={hexPerim} strokeDashoffset={hexPerim}
            style={{ animation: `mc-hex-draw 1.0s ease-out 1.1s forwards` }}
          />
          {/* 꼭짓점 6개 — 순서대로 등장 */}
          {hex.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5.5" fill="#6366f1" opacity="0"
              style={{ animation: `mc-fade 0.25s ease-out ${0.05 + i * 0.17}s forwards` }}
            />
          ))}
        </g>

        {/* ── 내부 그룹: 삼각형 (반시계방향) ── */}
        <g filter="url(#mc-glow)" style={{
          transformBox: 'view-box',
          transformOrigin: 'center',
          animation: `mc-accel-ccw ${ACCEL}s linear ${BUILD}s,
                      mc-spin-ccw 1.1s linear ${STEADY}s infinite`,
        }}>
          {/* 내부 링 */}
          <circle r={22} fill="none" stroke="#a5b4fc" strokeWidth="1.2"
            strokeDasharray={innerPerim} strokeDashoffset={innerPerim}
            style={{ animation: `mc-ring-in 0.65s ease-out 2.0s forwards` }}
          />
          {/* 삼각형 변 */}
          <polygon points={triPts} fill="none" stroke="#818cf8" strokeWidth="2"
            strokeDasharray={triPerim} strokeDashoffset={triPerim}
            style={{ animation: `mc-tri-draw 0.8s ease-out 1.6s forwards` }}
          />
          {/* 꼭짓점 3개 */}
          {tri.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="#818cf8" opacity="0"
              style={{ animation: `mc-fade 0.25s ease-out ${0.9 + i * 0.2}s forwards` }}
            />
          ))}
        </g>

        {/* ── 중심 ── */}
        <g style={{
          transformBox: 'view-box',
          transformOrigin: 'center',
          animation: `mc-pulse 1.4s ease-in-out ${BUILD}s infinite`,
        }}>
          <circle r="9" fill="#4f46e5" opacity="0" filter="url(#mc-glow)"
            style={{ animation: `mc-fade 0.3s ease-out 0s forwards` }}
          />
          <circle r="3.5" fill="white" opacity="0"
            style={{ animation: `mc-fade 0.3s ease-out 0.12s forwards` }}
          />
        </g>
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
