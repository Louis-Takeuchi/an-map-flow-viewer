import { useMemo } from 'react';
import Dagre from '@dagrejs/dagre';
import flowData from '../data/flowData';
import { getOutcomeEdgeColor } from '../config/flowPresentation';

function truncate(text, max = 15) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function buildGraph(flowKind) {
  const flowNodes = flowData.nodes.filter((n) => n.flow_kind === flowKind);
  const rfNodes = [];
  const rfEdges = [];
  const outcomeSet = new Map();

  for (const node of flowNodes) {
    rfNodes.push({
      id: node.node_id,
      type: 'question',
      data: {
        nodeId: node.node_id,
        questionText: node.question_text,
        responseType: node.response_type,
        options: node.options,
        flowKind: node.flow_kind,
        subtitle: node.subtitle,
        evidence: node.evidence,
        protocolVersion: node.protocol_version,
      },
      position: { x: 0, y: 0 },
    });

    for (const opt of node.options) {
      if (opt.next_node_id) {
        rfEdges.push({
          id: `${node.node_id}-${opt.option_id}`,
          source: node.node_id,
          target: opt.next_node_id,
          data: { fullLabel: truncate(opt.option_text), isOutcome: false },
          type: 'smoothstep',
          style: { strokeWidth: 1.5, stroke: '#94a3b8' },
        });
      } else if (opt.outcome_id) {
        if (!outcomeSet.has(opt.outcome_id)) {
          outcomeSet.set(opt.outcome_id, flowData.outcomes[opt.outcome_id]);
        }
        const outcomeColor = getOutcomeEdgeColor(opt.outcome_id, opt.triage_level);
        rfEdges.push({
          id: `${node.node_id}-${opt.option_id}-out`,
          source: node.node_id,
          target: `outcome_${opt.outcome_id}`,
          data: { fullLabel: truncate(opt.option_text), isOutcome: true, outcomeColor },
          type: 'smoothstep',
          style: { strokeWidth: 1.5, stroke: outcomeColor, strokeDasharray: '6 3' },
        });
      }
    }
  }

  for (const [outcomeId, outcome] of outcomeSet) {
    rfNodes.push({
      id: `outcome_${outcomeId}`,
      type: 'outcome',
      data: {
        ...outcome,
      },
      position: { x: 0, y: 0 },
    });
  }

  return { rfNodes, rfEdges };
}

function applyDagreLayout(nodes, edges) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 100 });

  for (const node of nodes) {
    const width = node.type === 'outcome' ? 180 : 220;
    const height = node.type === 'outcome' ? 110 : 100;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.type === 'outcome' ? 180 : 220;
    const height = node.type === 'outcome' ? 110 : 100;
    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    };
  });
}

export function useFlowGraph(flowKind) {
  return useMemo(() => {
    const { rfNodes, rfEdges } = buildGraph(flowKind);
    const layoutNodes = applyDagreLayout(rfNodes, rfEdges);
    return { nodes: layoutNodes, edges: rfEdges };
  }, [flowKind]);
}
