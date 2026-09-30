import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowTabs from './components/FlowTabs';
import FlowCanvas from './components/FlowCanvas';
import DetailPanel from './components/DetailPanel';
import TraceView from './components/TraceView';
import ViewerGuide from './components/ViewerGuide';
import SourceStatus from './components/SourceStatus';
import { useFlowGraph } from './hooks/useFlowGraph';

const HIGHLIGHT_COLOR = '#0891b2';

function FlowView({ flowKind, labelsAlwaysOn }) {
  const { nodes, edges } = useFlowGraph(flowKind);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleViewportChange = useCallback((viewport) => {
    setZoom(viewport.zoom);
  }, []);

  const handleNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setHoveredNodeId(null);
  }, []);

  const handleNodeMouseEnter = useCallback((_event, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const derivedNodes = useMemo(() => {
    if (!selectedNode) return nodes;
    const connectedIds = new Set([selectedNode.id]);
    for (const edge of edges) {
      if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
        connectedIds.add(edge.source);
        connectedIds.add(edge.target);
      }
    }
    return nodes.map((node) => ({
      ...node,
      className: node.id === selectedNode.id
        ? 'overview-node--selected'
        : connectedIds.has(node.id)
          ? 'overview-node--connected'
          : 'overview-node--dimmed',
    }));
  }, [nodes, edges, selectedNode?.id]);

  const derivedEdges = useMemo(() => {
    const activeNodeId = selectedNode?.id || hoveredNodeId;
    return edges.map((edge) => {
      const connected = activeNodeId &&
        (edge.source === activeNodeId || edge.target === activeNodeId);
      const showLabel = labelsAlwaysOn || connected;

      let stroke = edge.data?.isOutcome
        ? (edge.data.outcomeColor || '#94a3b8')
        : '#94a3b8';
      let strokeWidth = 1.5;
      if (connected) {
        stroke = HIGHLIGHT_COLOR;
        // React Flow scales the enclosing HTML viewport, so compensate here
        // to retain a visible screen-space width at overview zoom levels.
        strokeWidth = (selectedNode ? 4.5 : 3) / zoom;
      }

      return {
        ...edge,
        label: showLabel ? edge.data?.fullLabel : undefined,
        className: connected ? 'overview-edge--highlighted' : undefined,
        zIndex: connected ? 10 : 0,
        labelStyle: connected
          ? { fill: '#0e7490', fontWeight: 700 }
          : { opacity: selectedNode ? 0.18 : 1 },
        labelBgStyle: connected
          ? { fill: '#fff', fillOpacity: 0.98 }
          : { opacity: selectedNode ? 0.18 : 1 },
        style: {
          ...edge.style,
          stroke,
          strokeWidth,
          strokeDasharray: connected ? 'none' : edge.style?.strokeDasharray,
          opacity: selectedNode && !connected ? 0.12 : 1,
        },
      };
    });
  }, [edges, selectedNode?.id, hoveredNodeId, labelsAlwaysOn, zoom]);

  return (
    <div className="flow-container">
      <div className="canvas-area">
        <ReactFlowProvider>
          <FlowCanvas
            nodes={derivedNodes}
            edges={derivedEdges}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            onViewportChange={handleViewportChange}
          />
        </ReactFlowProvider>
      </div>
      <DetailPanel
        node={selectedNode}
        onClose={handlePaneClick}
      />
    </div>
  );
}

export default function App() {
  const [activeFlow, setActiveFlow] = useState('emergency');
  const [mode, setMode] = useState('overview');
  const [labelsAlwaysOn, setLabelsAlwaysOn] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>安心マップ 問診フロー</h1>
          <p>Flow Viewer / 技術資料</p>
        </div>
        <FlowTabs activeFlow={activeFlow} onChange={setActiveFlow} />
        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-btn ${mode === 'overview' ? 'active' : ''}`}
            onClick={() => setMode('overview')}
            aria-pressed={mode === 'overview'}
          >
            俯瞰 / Overview
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'trace' ? 'active' : ''}`}
            onClick={() => setMode('trace')}
            aria-pressed={mode === 'trace'}
          >
            トレース / Trace
          </button>
        </div>
        {mode === 'overview' && (
          <button
            type="button"
            className={`label-toggle ${labelsAlwaysOn ? 'active' : ''}`}
            onClick={() => setLabelsAlwaysOn((v) => !v)}
            aria-pressed={labelsAlwaysOn}
          >
            選択肢ラベル {labelsAlwaysOn ? 'ON' : 'OFF'}
          </button>
        )}
      </header>
      <SourceStatus flowKind={activeFlow} />
      <ViewerGuide mode={mode} />
      {mode === 'overview' ? (
        <FlowView
          key={`overview-${activeFlow}`}
          flowKind={activeFlow}
          labelsAlwaysOn={labelsAlwaysOn}
        />
      ) : (
        <TraceView key={`trace-${activeFlow}`} flowKind={activeFlow} />
      )}
    </div>
  );
}
