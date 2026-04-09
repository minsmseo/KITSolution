import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import AppLayout from '../components/Layout/AppLayout'
import { lectureAPI, graphAPI, assignmentAPI } from '../services/api'
import KnowledgeGraph from '../components/Graph/KnowledgeGraph'
import NodeDetailPanel from '../components/Graph/NodeDetailPanel'
import AssignmentPanel from '../components/Assignment/AssignmentPanel'
import UploadTextPanel from '../components/Lecture/UploadTextPanel'
import {
  Network, RefreshCw, Users, ChevronDown, ChevronRight,
  FileText, Send, Clock, Tag, BookOpen, CheckCircle, Circle,
} from 'lucide-react'

const TYPE_LABELS = {
  short_answer: '단답형',
  concept_explanation: '개념 설명',
  compare_contrast: '비교·대조',
  summary: '요약',
  mini_quiz: '미니 퀴즈',
}

// ── Instructor: student assignment viewer ──────────────
function InstructorStudentPanel({ lectureId }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [expandedAssignment, setExpandedAssignment] = useState({})

  useEffect(() => {
    assignmentAPI.instructorStudents(lectureId)
      .then(res => setStudents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lectureId])

  const toggle = (sid) => setExpanded(p => ({ ...p, [sid]: !p[sid] }))
  const toggleA = (aid) => setExpandedAssignment(p => ({ ...p, [aid]: !p[aid] }))

  if (loading) return (
    <div className="card p-6 text-center text-slate-400 text-sm">학생 데이터 로딩 중...</div>
  )

  if (!students.length) return (
    <div className="card p-8 text-center text-slate-400">
      <Users size={32} className="mx-auto mb-2 opacity-30" />
      <p className="text-sm">수강생이 없습니다</p>
    </div>
  )

  return (
    <div className="card">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2">
        <Users size={16} className="text-blue-500" />
        <h3 className="font-semibold text-slate-900 text-sm">수강생 과제 현황</h3>
        <span className="ml-auto text-xs text-slate-400">{students.length}명</span>
      </div>

      <div className="divide-y divide-slate-100">
        {students.map(s => {
          const totalA = s.assignments.length
          const totalS = s.assignments.filter(a => a.submission).length
          const isOpen = expanded[s.student_id]

          return (
            <div key={s.student_id}>
              {/* Student row */}
              <button
                onClick={() => toggle(s.student_id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 text-xs font-bold">{s.student_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{s.student_name}</p>
                  <p className="text-xs text-slate-400 truncate hidden sm:block">{s.student_email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  <span className="flex items-center gap-1 text-slate-500">
                    <FileText size={11} className="text-blue-400" /> {totalA}건
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Send size={11} className="text-emerald-400" /> {totalS}건
                  </span>
                  {totalA === 0
                    ? <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs">미참여</span>
                    : totalS === totalA
                    ? <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs">완료</span>
                    : <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs">진행중</span>
                  }
                </div>
                {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              </button>

              {/* Assignment list */}
              {isOpen && (
                <div className="bg-slate-50 px-4 pb-3 space-y-2">
                  {s.assignments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">생성된 과제가 없습니다</p>
                  ) : s.assignments.map((a, idx) => {
                    const isAOpen = expandedAssignment[a.id]
                    return (
                      <div key={a.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <button
                          onClick={() => toggleA(a.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                        >
                          <span className="text-xs text-slate-400 font-mono w-5 flex-shrink-0">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-slate-700">
                                {TYPE_LABELS[a.assignment_type] || a.assignment_type}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {(a.selected_keywords || []).slice(0, 3).map(kw => (
                                  <span key={kw} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                                    {kw}
                                  </span>
                                ))}
                                {(a.selected_keywords || []).length > 3 && (
                                  <span className="text-xs text-slate-400">+{a.selected_keywords.length - 3}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(a.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {a.submission
                              ? <CheckCircle size={14} className="text-emerald-500" />
                              : <Circle size={14} className="text-slate-300" />
                            }
                          </div>
                          {isAOpen ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                        </button>

                        {isAOpen && (
                          <div className="border-t border-slate-100 divide-y divide-slate-50">
                            {/* Generated assignment */}
                            <div className="px-3 py-3">
                              <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                                <FileText size={11} /> 생성된 과제
                              </p>
                              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                {a.generated_text}
                              </div>
                            </div>
                            {/* Submission */}
                            <div className="px-3 py-3">
                              <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                                <Send size={11} /> 제출 답안
                                {a.submission && (
                                  <span className="ml-1 text-slate-400">
                                    · {new Date(a.submission.submitted_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </p>
                              {a.submission ? (
                                <div className="bg-emerald-50 rounded-lg p-3 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-emerald-100">
                                  {a.submission.answer_text}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">아직 제출하지 않았습니다</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main LectureDetail ─────────────────────────────────
export default function LectureDetail() {
  const { lectureId } = useParams()
  const { user } = useAuth()
  const [lecture, setLecture] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [activeNode, setActiveNode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('graph') // 'graph' | 'students'

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin'
  const isStudent = user?.role === 'student' || user?.role === 'admin'

  const fetchLecture = useCallback(async () => {
    try {
      const res = await lectureAPI.get(lectureId)
      setLecture(res.data)
      if (res.data.graph_status === 'completed') {
        try {
          const graphRes = await graphAPI.get(lectureId)
          setGraphData(graphRes.data)
        } catch {}
      }
    } catch {}
    setLoading(false)
  }, [lectureId])

  useEffect(() => { fetchLecture() }, [fetchLecture])

  const handleNodeClick = (node) => setActiveNode(node)
  const handleToggleSelect = (nodeId) => {
    const node = graphData?.nodes.find(n => n.id === nodeId)
    const label = node?.label || nodeId
    setSelectedNodes(prev => prev.includes(label) ? prev.filter(k => k !== label) : [...prev, label])
  }
  const handleRemoveKeyword = (kw) => setSelectedNodes(prev => prev.filter(k => k !== kw))

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-slate-400">로딩 중...</div>
    </AppLayout>
  )
  if (!lecture) return <AppLayout><p className="text-slate-500">강의를 찾을 수 없습니다.</p></AppLayout>

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{lecture.title}</h1>
            {lecture.description && (
              <p className="text-slate-500 mt-1 text-sm">{lecture.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <GraphStatusBadge status={lecture.graph_status} />
            <button
              onClick={fetchLecture}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tabs for instructor */}
        {isInstructor && (
          <div className="flex gap-1 mt-4 bg-slate-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'graph' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Network size={14} /> 지식 그래프
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={14} /> 학생 과제 현황
            </button>
          </div>
        )}
      </div>

      {/* Instructor: student assignments tab */}
      {isInstructor && activeTab === 'students' && (
        <InstructorStudentPanel lectureId={lectureId} />
      )}

      {/* Graph tab (default for all, always shown for students) */}
      {(activeTab === 'graph' || !isInstructor) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {isInstructor && (
              <UploadTextPanel lecture={lecture} onUpdated={fetchLecture} />
            )}

            {/* Knowledge Graph */}
            <div className="card">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Network size={16} className="text-blue-500" /> 지식 그래프
                </h3>
                {selectedNodes.length > 0 && (
                  <span className="badge bg-amber-100 text-amber-700 text-xs">
                    {selectedNodes.length}개 선택됨
                  </span>
                )}
              </div>

              {lecture.graph_status !== 'completed' ? (
                <div className="p-12 text-center text-slate-400">
                  {lecture.graph_status === 'processing' ? (
                    <div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                      <p className="text-sm">지식 그래프 생성 중...</p>
                    </div>
                  ) : (
                    <div>
                      <Network size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">지식 그래프가 아직 생성되지 않았습니다.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative" style={{ height: 480 }}>
                  <KnowledgeGraph
                    graphData={graphData}
                    selectedNodes={selectedNodes.map(kw => graphData?.nodes.find(n => n.label === kw)?.id).filter(Boolean)}
                    onNodeClick={handleNodeClick}
                  />
                  {activeNode && (
                    <NodeDetailPanel
                      node={activeNode}
                      graphData={graphData}
                      selectedNodes={selectedNodes.map(kw => graphData?.nodes.find(n => n.label === kw)?.id).filter(Boolean)}
                      onToggleSelect={handleToggleSelect}
                      onClose={() => setActiveNode(null)}
                    />
                  )}
                </div>
              )}

              {lecture.graph_status === 'completed' && graphData && (
                <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex gap-4">
                  <span>{graphData.nodes?.length || 0}개 개념</span>
                  <span>{graphData.edges?.length || 0}개 연결</span>
                  {isStudent && <span className="text-blue-500">노드를 클릭해 복습할 개념을 선택하세요</span>}
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-5">
            {isStudent && (
              <AssignmentPanel
                lectureId={lectureId}
                selectedKeywords={selectedNodes}
                onClearSelection={handleRemoveKeyword}
              />
            )}

            {graphData?.nodes?.length > 0 && (
              <div className="card">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Tag size={14} className="text-slate-400" /> 전체 개념
                  </h3>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {graphData.nodes.map(node => {
                      const isSelected = selectedNodes.includes(node.label)
                      return (
                        <button
                          key={node.id}
                          onClick={() => isStudent && handleToggleSelect(node.id)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-100 text-amber-800'
                              : isStudent
                              ? 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                              : 'bg-slate-100 text-slate-600 cursor-default'
                          }`}
                        >
                          {node.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
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
