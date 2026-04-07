import { useState, useRef } from 'react'
import { lectureAPI, graphAPI } from '../../services/api'
import { Upload, Cpu, FileText, AlertCircle } from 'lucide-react'

const MAX_CHARS = 50000

export default function UploadTextPanel({ lecture, onUpdated }) {
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setText(ev.target.result)
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!text.trim()) return setError('Text cannot be empty')
    if (text.length > MAX_CHARS) return setError(`Text exceeds ${MAX_CHARS} character limit`)
    setError('')
    setUploading(true)
    try {
      await lectureAPI.uploadText(lecture.id, text)
      setUploadSuccess(true)
      onUpdated?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleGenerate = async () => {
    setError('')
    setGenerating(true)
    try {
      await graphAPI.generate(lecture.id)
      onUpdated?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Graph generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const status = lecture.graph_status

  return (
    <div className="card">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" /> Lecture Material
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Paste or upload lecture text</label>
            <span className="text-xs text-slate-400">{text.length}/{MAX_CHARS}</span>
          </div>
          <textarea
            className="input resize-none font-mono text-xs"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your lecture notes, slides text, or any educational content here..."
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => fileRef.current.click()} className="btn-secondary flex items-center gap-2">
            <Upload size={16} /> Import .txt
          </button>
          <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFile} />
          <button
            onClick={handleUpload}
            disabled={uploading || !text.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <FileText size={16} />
            {uploading ? 'Uploading...' : 'Save Text'}
          </button>
        </div>

        {uploadSuccess || lecture.source_text_gcs_path ? (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Knowledge Graph Generation</p>
            <div className="flex items-center gap-3">
              <GraphStatusBadge status={status} />
              {(status === 'pending' || status === 'failed') && (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn-primary flex items-center gap-2"
                >
                  <Cpu size={16} />
                  {generating ? 'Generating...' : 'Generate Knowledge Graph'}
                </button>
              )}
              {status === 'processing' && (
                <span className="text-sm text-amber-600 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600" />
                  Processing...
                </span>
              )}
              {status === 'completed' && (
                <span className="text-sm text-emerald-600">Graph ready! View it below.</span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function GraphStatusBadge({ status }) {
  const config = {
    pending: 'bg-slate-100 text-slate-600',
    processing: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  }
  return <span className={`badge ${config[status] || config.pending} capitalize`}>{status}</span>
}
