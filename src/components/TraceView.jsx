import { useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from './FlowCanvas';
import QuestionPanel from './QuestionPanel';
import TriageResult from './TriageResult';
import PathBreadcrumbs from './PathBreadcrumbs';
import { useFlowGraph } from '../hooks/useFlowGraph';
import { useTraceState } from '../hooks/useTraceState';

export default function TraceView({ flowKind }) {
  const { nodes, edges } = useFlowGraph(flowKind);
  const trace = useTraceState(flowKind);

  // Nodes: current=highlight, visited=confirmed, rest=dimmed
  const derivedNodes = useMemo(() => {
    return nodes.map((node) => {
      let className = 'trace-dimmed';
      if (!trace.outcome && node.id === trace.currentNodeId) {
        className = 'trace-current';
      } else if (node.id === trace.reachedOutcomeNodeId) {
        className = 'trace-outcome-reached';
      } else if (trace.visitedNodeIds.has(node.id)) {
        className = 'trace-visited';
      }
      return { ...node, className };
    });
  }, [
    nodes,
    trace.currentNodeId,
    trace.outcome,
    trace.reachedOutcomeNodeId,
    trace.visitedNodeIds,
  ]);

  // Edges: visited=bold teal, rest=dimmed
  const derivedEdges = useMemo(() => {
    return edges.map((edge) => {
      const isVisited = trace.visitedEdgeIds.has(edge.id);
      return {
        ...edge,
        label: isVisited ? edge.data?.fullLabel : undefined,
        style: {
          ...edge.style,
          stroke: isVisited ? '#0891b2' : '#d1d5db',
          strokeWidth: isVisited ? 2.5 : 1,
          opacity: isVisited ? 1 : 0.25,
        },
      };
    });
  }, [edges, trace.visitedEdgeIds]);

  return (
    <div className="trace-layout">
      <div className="trace-graph">
        <ReactFlowProvider>
          <FlowCanvas nodes={derivedNodes} edges={derivedEdges} />
        </ReactFlowProvider>
      </div>

      <div className="trace-panel">
        {trace.outcome ? (
          <TriageResult
            outcome={trace.outcome}
            onBack={trace.goBack}
            onReset={trace.reset}
          />
        ) : (
          <QuestionPanel
            node={trace.currentNode}
            stepIndex={trace.stepCount}
            totalNodes={trace.totalNodes}
            onSelect={trace.advance}
            onBack={trace.goBack}
            onReset={trace.reset}
            canGoBack={trace.stepCount > 0}
          />
        )}
      </div>

      <div className="trace-breadcrumbs">
        <PathBreadcrumbs
          history={trace.history}
          currentNodeId={trace.currentNodeId}
          outcome={trace.outcome}
        />
      </div>
    </div>
  );
}
