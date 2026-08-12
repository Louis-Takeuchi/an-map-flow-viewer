import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowTabs from './components/FlowTabs';
import FlowCanvas from './components/FlowCanvas';
import DetailPanel from './components/DetailPanel';
import TraceView from './components/TraceView';
import { useFlowGraph } from './hooks/useFlowGraph';

const HIGHLIGHT_COLOR = '#0891b2';

function FlowView({ flowKind, labelsAlwaysOn }) {
  const { nodes, edges } = useFlowGraph(flowKind);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const handleNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeMouseEnter = useCallback((_event, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

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
        strokeWidth = 2.5;
      }

      return {
        ...edge,
        label: showLabel ? edge.data?.fullLabel : undefined,
        style: {
          ...edge.style,
          stroke,
          strokeWidth,
        },
      };
    });
  }, [edges, selectedNode?.id, hoveredNodeId, labelsAlwaysOn]);

  return (
    <div className="flow-container">
      <div className="canvas-area">
        <ReactFlowProvider>
          <FlowCanvas
            nodes={nodes}
            edges={derivedEdges}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
          />
        </ReactFlowProvider>
      </div>
      <DetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
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
        <h1>安心マップ 問診フロー</h1>
        <FlowTabs activeFlow={activeFlow} onChange={setActiveFlow} />
        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-btn ${mode === 'overview' ? 'active' : ''}`}
            onClick={() => setMode('overview')}
          >
            俯瞰
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'trace' ? 'active' : ''}`}
            onClick={() => setMode('trace')}
          >
            トレース
          </button>
        </div>
        {mode === 'overview' && (
          <button
            className={`label-toggle ${labelsAlwaysOn ? 'active' : ''}`}
            onClick={() => setLabelsAlwaysOn((v) => !v)}
          >
            選択肢ラベル {labelsAlwaysOn ? 'ON' : 'OFF'}
          </button>
        )}
      </header>
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
