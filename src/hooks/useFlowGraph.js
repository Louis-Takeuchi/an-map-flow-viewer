import { useMemo } from 'react';
import Dagre from '@dagrejs/dagre';
import flowData from '../data/flow_v1.0.json';

const OUTCOME_LABELS = {
  out_red: '119番通報',
  out_yellow: '急性期受診',
  out_yellow_home: '往診・オンライン',
  out_green: '一般外来',
  out_white: 'セルフケア',
  out_mental_consult: '精神科相談',
  out_phone_consult: '#7119/#8000',
  out_done: '完了',
  out_escalate: '救急フローへ',
  out_hospital: '病院紹介',
  hp_escalate: '救急フローへ',
  hp_done: '受診案内完了',
};

const TRIAGE_EDGE_COLORS = {
  red: '#dc2626',
  yellow: '#d97706',
  green: '#16a34a',
  white: '#94a3b8',
};

function getOutcomeEdgeColor(outcomeId, triageLevel) {
  if (outcomeId === 'out_mental_consult' || outcomeId === 'out_phone_consult') {
    return '#7c3aed';
  }
  return TRIAGE_EDGE_COLORS[triageLevel] || '#7c3aed';
}

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
          outcomeSet.set(opt.outcome_id, opt.triage_level || null);
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

  for (const [outcomeId, triageLevel] of outcomeSet) {
    rfNodes.push({
      id: `outcome_${outcomeId}`,
      type: 'outcome',
      data: {
        outcomeId,
        label: OUTCOME_LABELS[outcomeId] || outcomeId,
        triageLevel,
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
    const width = node.type === 'outcome' ? 140 : 220;
    const height = node.type === 'outcome' ? 50 : 80;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.type === 'outcome' ? 140 : 220;
    const height = node.type === 'outcome' ? 50 : 80;
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
