import { X, Tag, Link2 } from 'lucide-react'

export default function NodeDetailPanel({ node, graphData, selectedNodes, onToggleSelect, onClose }) {
  if (!node) return null

  const isSelected = selectedNodes?.includes(node.id)

  // Find related nodes
  const relatedEdges = (graphData?.edges || []).filter(
    (e) => e.source === node.id || e.target === node.id
  )
  const relatedNodeIds = relatedEdges.flatMap((e) => [e.source, e.target]).filter((id) => id !== node.id)
  const relatedNodes = (graphData?.nodes || []).filter((n) => relatedNodeIds.includes(n.id))

  return (
    <div className="absolute top-4 right-4 w-72 card shadow-lg z-10">
      <div className="flex items-start justify-between p-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900">{node.label || node.name}</h3>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
            {node.type}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {node.description && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-700">{node.description}</p>
          </div>
        )}

        {relatedNodes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Link2 size={12} /> Related Concepts
            </p>
            <div className="space-y-1">
              {relatedNodes.slice(0, 5).map((rn) => (
                <div key={rn.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{rn.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onToggleSelect(node.id)}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isSelected ? 'Remove from selection' : 'Select for review'}
        </button>
      </div>
    </div>
  )
}
