import { useState } from 'react'
import { assignmentAPI } from '../../services/api'
import { Sparkles, Send, X, ChevronDown } from 'lucide-react'

const ASSIGNMENT_TYPES = [
  { value: 'short_answer', label: 'Short Answer Questions' },
  { value: 'concept_explanation', label: 'Concept Explanation' },
  { value: 'compare_contrast', label: 'Compare & Contrast' },
  { value: 'summary', label: 'Summary Task' },
  { value: 'mini_quiz', label: 'Mini Quiz' },
]

const DIFFICULTIES = ['easy', 'medium', 'hard']

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
      setError(err.response?.data?.detail || 'Failed to generate assignment')
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit')
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

      <div className="p-4 space-y-4">
        {/* Selected keywords */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Selected Keywords</p>
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
          <select
            className="input"
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
          >
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
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          {generating ? 'Generating...' : 'Generate Assignment'}
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
                <textarea
                  className="input resize-none"
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !answer.trim()}
                  className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
                >
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
    </div>
  )
}
