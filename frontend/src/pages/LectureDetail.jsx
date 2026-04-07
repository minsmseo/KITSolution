import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/Layout/AppLayout'
import { lectureAPI, graphAPI } from '../services/api'
import KnowledgeGraph from '../components/Graph/KnowledgeGraph'
import NodeDetailPanel from '../components/Graph/NodeDetailPanel'
import AssignmentPanel from '../components/Assignment/AssignmentPanel'
import UploadTextPanel from '../components/Lecture/UploadTextPanel'
import { Network, Users, RefreshCw } from 'lucide-react'

export default function LectureDetail() {
  const { lectureId } = useParams()
  const { user } = useAuth()
  const [lecture, setLecture] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [activeNode, setActiveNode] = useState(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchLecture()
  }, [fetchLecture])

  const handleNodeClick = (node) => {
    setActiveNode(node)
  }

  const handleToggleSelect = (nodeId) => {
    const node = graphData?.nodes.find((n) => n.id === nodeId)
    const label = node?.label || nodeId
    setSelectedNodes((prev) =>
      prev.includes(label) ? prev.filter((k) => k !== label) : [...prev, label]
    )
  }

  const handleRemoveKeyword = (kw) => {
    setSelectedNodes((prev) => prev.filter((k) => k !== kw))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
      </AppLayout>
    )
  }

  if (!lecture) {
    return <AppLayout><p className="text-slate-500">Lecture not found.</p></AppLayout>
  }

  return (
    <AppLayout>
      {/* Lecture header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lecture.title}</h1>
            {lecture.description && (
              <p className="text-slate-500 mt-1">{lecture.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GraphStatusBadge status={lecture.graph_status} />
            <button
              onClick={fetchLecture}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload panel for instructors */}
          {isInstructor && (
            <UploadTextPanel lecture={lecture} onUpdated={fetchLecture} />
          )}

          {/* Knowledge Graph Visualization */}
          <div className="card">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Network size={18} className="text-indigo-600" /> Knowledge Graph
              </h3>
              {selectedNodes.length > 0 && (
                <span className="badge bg-amber-100 text-amber-700">
                  {selectedNodes.length} selected
                </span>
              )}
            </div>

            {lecture.graph_status !== 'completed' ? (
              <div className="p-12 text-center text-slate-400">
                {lecture.graph_status === 'processing' ? (
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
                    <p>Generating knowledge graph...</p>
                  </div>
                ) : (
                  <div>
                    <Network size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Knowledge graph not generated yet.</p>
                    {isInstructor && (
                      <p className="text-sm mt-1">Upload lecture text and generate the graph above.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" style={{ height: 500 }}>
                <KnowledgeGraph
                  graphData={graphData}
                  selectedNodes={selectedNodes.map((kw) =>
                    graphData?.nodes.find((n) => n.label === kw)?.id
                  ).filter(Boolean)}
                  onNodeClick={handleNodeClick}
                />
                {activeNode && (
                  <NodeDetailPanel
                    node={activeNode}
                    graphData={graphData}
                    selectedNodes={selectedNodes.map((kw) =>
                      graphData?.nodes.find((n) => n.label === kw)?.id
                    ).filter(Boolean)}
                    onToggleSelect={handleToggleSelect}
                    onClose={() => setActiveNode(null)}
                  />
                )}
              </div>
            )}

            {lecture.graph_status === 'completed' && graphData && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex gap-4">
                <span>{graphData.nodes?.length || 0} concepts</span>
                <span>{graphData.edges?.length || 0} connections</span>
                <span className="text-indigo-500">Click nodes to select for review</span>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {isStudent && (
            <AssignmentPanel
              lectureId={lectureId}
              selectedKeywords={selectedNodes}
              onClearSelection={handleRemoveKeyword}
            />
          )}

          {/* Keyword list */}
          {graphData?.nodes && graphData.nodes.length > 0 && (
            <div className="card">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">All Keywords</h3>
              </div>
              <div className="p-3 max-h-80 overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {graphData.nodes.map((node) => {
                    const isSelected = selectedNodes.includes(node.label)
                    return (
                      <button
                        key={node.id}
                        onClick={() => isStudent && handleToggleSelect(node.id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          isSelected
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
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
  return <span className={`badge ${config[status] || config.pending} capitalize`}>{status}</span>
}
