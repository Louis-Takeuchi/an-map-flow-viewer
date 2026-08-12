import { useState, useCallback, useMemo } from 'react';
import flowData from '../data/flow_v1.0.json';
import { FLOW_DEFINITION_BY_KEY } from '../config/flowMetadata';

export function useTraceState(flowKind) {
  const entryNodeId = FLOW_DEFINITION_BY_KEY[flowKind].entryNodeId;

  const nodeMap = useMemo(() => {
    const map = new Map();
    for (const node of flowData.nodes) {
      if (node.flow_kind === flowKind) {
        map.set(node.node_id, node);
      }
    }
    return map;
  }, [flowKind]);

  const [currentNodeId, setCurrentNodeId] = useState(entryNodeId);
  const [history, setHistory] = useState([]);
  const [outcome, setOutcome] = useState(null);

  const currentNode = nodeMap.get(currentNodeId) || null;

  const advance = useCallback(
    (optionId) => {
      if (!currentNode) return;
      const option = currentNode.options.find((o) => o.option_id === optionId);
      if (!option) return;

      const entry = {
        nodeId: currentNodeId,
        optionId,
        optionText: option.option_text,
      };
      setHistory((prev) => [...prev, entry]);

      if (option.next_node_id) {
        setCurrentNodeId(option.next_node_id);
      } else {
        setOutcome({
          outcomeId: option.outcome_id || null,
          triageLevel: option.triage_level || null,
          optionText: option.option_text,
        });
      }
    },
    [currentNode, currentNodeId],
  );

  const goBack = useCallback(() => {
    if (outcome) {
      setOutcome(null);
      setHistory((prev) => prev.slice(0, -1));
      return;
    }
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentNodeId(last.nodeId);
  }, [outcome, history]);

  const reset = useCallback(() => {
    setCurrentNodeId(entryNodeId);
    setHistory([]);
    setOutcome(null);
  }, [entryNodeId]);

  const reachedOutcomeNodeId = outcome?.outcomeId
    ? `outcome_${outcome.outcomeId}`
    : null;

  const visitedNodeIds = useMemo(() => {
    const set = new Set(history.map((h) => h.nodeId));
    set.add(currentNodeId);
    if (reachedOutcomeNodeId) set.add(reachedOutcomeNodeId);
    return set;
  }, [history, currentNodeId, reachedOutcomeNodeId]);

  const visitedEdgeIds = useMemo(() => {
    const set = new Set();
    for (const step of history) {
      // covers both question→question and question→outcome edge IDs
      set.add(`${step.nodeId}-${step.optionId}`);
      set.add(`${step.nodeId}-${step.optionId}-out`);
    }
    return set;
  }, [history]);

  return {
    currentNodeId,
    currentNode,
    history,
    outcome,
    advance,
    goBack,
    reset,
    visitedNodeIds,
    visitedEdgeIds,
    reachedOutcomeNodeId,
    stepCount: history.length,
    totalNodes: nodeMap.size,
  };
}
