import { useRef, useEffect, useCallback, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

const TYPE_COLORS = {
  Concept: '#4f46e5',
  Topic: '#0891b2',
  Definition: '#059669',
  Formula: '#d97706',
  Example: '#7c3aed',
  Prerequisite: '#dc2626',
  RelatedConcept: '#0d9488',
}

export default function KnowledgeGraph({ graphData, selectedNodes, onNodeClick }) {
  const fgRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 })
  const containerRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Transform graph data for force-graph
  const data = {
    nodes: (graphData?.nodes || []).map((n) => ({
      ...n,
      id: n.id,
      name: n.label,
      color: selectedNodes?.includes(n.id)
        ? '#f59e0b'
        : TYPE_COLORS[n.type] || '#4f46e5',
      val: selectedNodes?.includes(n.id) ? 8 : 4,
    })),
    links: (graphData?.edges || []).map((e) => ({
      source: e.source,
      target: e.target,
      label: e.relation,
    })),
  }

  const handleNodeClick = useCallback((node) => {
    onNodeClick?.(node)
  }, [onNodeClick])

  const paintNode = useCallback((node, ctx, globalScale) => {
    const isSelected = selectedNodes?.includes(node.id)
    const radius = isSelected ? 8 : 5
    const label = node.name
    const fontSize = Math.max(10 / globalScale, 3)

    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = node.color
    ctx.fill()

    if (isSelected) {
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw label
    ctx.font = `${fontSize}px Sans-Serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#1e293b'
    ctx.fillText(label, node.x, node.y + radius + fontSize)
  }, [selectedNodes])

  if (!graphData || (!graphData.nodes?.length && !graphData.edges?.length)) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>No graph data available</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        onNodeClick={handleNodeClick}
        linkLabel={(link) => link.label}
        linkColor={() => '#cbd5e1'}
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        cooldownTicks={100}
        nodeLabel={(node) => `${node.name} (${node.type})`}
      />
    </div>
  )
}
