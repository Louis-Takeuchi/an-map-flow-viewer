import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FLOW_DEFINITIONS } from '../src/config/flowMetadata.js';
import { OUTCOME_LABELS } from '../src/config/flowPresentation.js';

const dataUrl = new URL('../src/data/flow_v1.0.json', import.meta.url);
const data = JSON.parse(await readFile(fileURLToPath(dataUrl), 'utf8'));
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

report(Array.isArray(data.nodes), 'Top-level "nodes" must be an array.');

const nodes = Array.isArray(data.nodes) ? data.nodes : [];
const nodeById = new Map();

for (const node of nodes) {
  report(typeof node.node_id === 'string' && node.node_id.length > 0,
    'Every node must have a non-empty node_id.');
  report(!nodeById.has(node.node_id), `Duplicate node_id: ${node.node_id}`);
  nodeById.set(node.node_id, node);
  report(typeof node.question_text === 'string' && node.question_text.length > 0,
    `Missing question_text: ${node.node_id}`);
  report(typeof node.response_type === 'string' && node.response_type.length > 0,
    `Missing response_type: ${node.node_id}`);
  report(Array.isArray(node.options) && node.options.length > 0,
    `Node must have at least one option: ${node.node_id}`);

  const optionIds = new Set();
  for (const option of node.options || []) {
    report(typeof option.option_id === 'string' && option.option_id.length > 0,
      `Missing option_id in node: ${node.node_id}`);
    report(!optionIds.has(option.option_id),
      `Duplicate option_id in ${node.node_id}: ${option.option_id}`);
    optionIds.add(option.option_id);
    report(typeof option.option_text === 'string' && option.option_text.length > 0,
      `Missing option_text: ${node.node_id}/${option.option_id}`);

    const hasNext = typeof option.next_node_id === 'string'
      && option.next_node_id.length > 0;
    const hasOutcome = typeof option.outcome_id === 'string'
      && option.outcome_id.length > 0;
    report(hasNext !== hasOutcome,
      `Option must reference exactly one next node or outcome: ${node.node_id}/${option.option_id}`);
  }
}

const documentedFlows = new Set(FLOW_DEFINITIONS.map((flow) => flow.key));
const actualFlows = new Set(nodes.map((node) => node.flow_kind));
report(actualFlows.size === FLOW_DEFINITIONS.length,
  `Flow count differs: expected ${FLOW_DEFINITIONS.length}, found ${actualFlows.size}`);
for (const flowKind of actualFlows) {
  report(documentedFlows.has(flowKind), `Undocumented flow_kind: ${flowKind}`);
}

const allOutcomeIds = new Set();

for (const flow of FLOW_DEFINITIONS) {
  const flowNodes = nodes.filter((node) => node.flow_kind === flow.key);
  const flowNodeIds = new Set(flowNodes.map((node) => node.node_id));
  const entryNode = nodeById.get(flow.entryNodeId);

  report(flowNodes.length === flow.documentedQuestionCount,
    `${flow.key} question count differs: expected ${flow.documentedQuestionCount}, found ${flowNodes.length}`);
  report(entryNode?.flow_kind === flow.key,
    `Invalid entry node for ${flow.key}: ${flow.entryNodeId}`);

  const flowOutcomeIds = new Set();
  for (const node of flowNodes) {
    for (const option of node.options || []) {
      if (option.next_node_id) {
        const target = nodeById.get(option.next_node_id);
        report(Boolean(target),
          `Missing next node: ${node.node_id}/${option.option_id} -> ${option.next_node_id}`);
        report(!target || target.flow_kind === flow.key,
          `Cross-flow transition: ${node.node_id} -> ${option.next_node_id}`);
      }
      if (option.outcome_id) {
        flowOutcomeIds.add(option.outcome_id);
        allOutcomeIds.add(option.outcome_id);
      }
    }
  }

  report(flowOutcomeIds.size === flow.documentedResultCount,
    `${flow.key} result count differs: expected ${flow.documentedResultCount}, found ${flowOutcomeIds.size}`);

  const reachable = new Set();
  const queue = [flow.entryNodeId];
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (reachable.has(currentId)) continue;
    reachable.add(currentId);
    const current = nodeById.get(currentId);
    for (const option of current?.options || []) {
      if (option.next_node_id) queue.push(option.next_node_id);
    }
  }

  for (const nodeId of flowNodeIds) {
    report(reachable.has(nodeId), `Unreachable node in ${flow.key}: ${nodeId}`);
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(nodeId) {
    if (visiting.has(nodeId)) {
      errors.push(`Cycle may prevent reaching a result in ${flow.key}: ${nodeId}`);
      return;
    }
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    const node = nodeById.get(nodeId);
    for (const option of node?.options || []) {
      if (option.next_node_id) visit(option.next_node_id);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  }
  visit(flow.entryNodeId);
}

report(nodes.length === 22,
  `Total question count differs from README: expected 22, found ${nodes.length}`);
report(allOutcomeIds.size === 12,
  `Total result count differs from README: expected 12, found ${allOutcomeIds.size}`);
for (const outcomeId of allOutcomeIds) {
  report(Boolean(OUTCOME_LABELS[outcomeId]),
    `Missing display label for outcome_id: ${outcomeId}`);
}
report(data.entry_node_id === 'em_who',
  `Top-level entry_node_id differs: expected em_who, found ${data.entry_node_id}`);

if (errors.length > 0) {
  console.error(`Flow validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Flow validation passed.');
  console.log(`- Flows: ${actualFlows.size}`);
  console.log(`- Question nodes: ${nodes.length}`);
  console.log(`- Result nodes: ${allOutcomeIds.size}`);
  console.log('- Duplicate IDs: 0');
  console.log('- Missing transitions: 0');
  console.log('- Unreachable nodes: 0');
  console.log('- Cycles without a guaranteed result: 0');
}
