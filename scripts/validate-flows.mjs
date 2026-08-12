import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FLOW_DEFINITIONS } from '../src/config/flowMetadata.js';
import {
  OUTCOME_LABELS,
  TRIAGE_PRESENTATION,
} from '../src/config/flowPresentation.js';

const dataUrl = new URL('../src/data/flow_v1.0.json', import.meta.url);
const data = JSON.parse(await readFile(fileURLToPath(dataUrl), 'utf8'));
const errors = [];
const warnings = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

report(data && typeof data === 'object' && !Array.isArray(data),
  'Top-level flow data must be an object.');
report(isNonEmptyString(data.entry_node_id),
  'Top-level entry_node_id must be a non-empty string.');
report(Array.isArray(data.nodes), 'Top-level nodes must be an array.');

const nodes = Array.isArray(data.nodes) ? data.nodes : [];
const nodeById = new Map();
const documentedFlows = new Set(FLOW_DEFINITIONS.map((flow) => flow.key));
const allowedTriageLevels = new Set(Object.keys(TRIAGE_PRESENTATION));
const outcomesWithoutTriageLevel = new Set();

for (const [nodeIndex, node] of nodes.entries()) {
  const nodeLabel = isNonEmptyString(node?.node_id)
    ? node.node_id
    : `nodes[${nodeIndex}]`;

  report(node && typeof node === 'object' && !Array.isArray(node),
    `${nodeLabel} must be an object.`);
  if (!node || typeof node !== 'object' || Array.isArray(node)) continue;

  report(isNonEmptyString(node.node_id),
    `${nodeLabel} must have a non-empty node_id.`);
  if (isNonEmptyString(node.node_id)) {
    report(!nodeById.has(node.node_id), `Duplicate node_id: ${node.node_id}`);
    if (!nodeById.has(node.node_id)) nodeById.set(node.node_id, node);
  }

  report(isNonEmptyString(node.question_text),
    `Missing question_text: ${nodeLabel}`);
  report(isNonEmptyString(node.response_type),
    `Missing response_type: ${nodeLabel}`);
  report(isNonEmptyString(node.flow_kind),
    `Missing flow_kind: ${nodeLabel}`);
  report(!isNonEmptyString(node.flow_kind) || documentedFlows.has(node.flow_kind),
    `Undocumented flow_kind in ${nodeLabel}: ${node.flow_kind}`);
  report(Array.isArray(node.options) && node.options.length > 0,
    `Node must have at least one option: ${nodeLabel}`);

  const optionIds = new Set();
  for (const [optionIndex, option] of (node.options || []).entries()) {
    const optionLabel = `${nodeLabel}/options[${optionIndex}]`;
    report(option && typeof option === 'object' && !Array.isArray(option),
      `${optionLabel} must be an object.`);
    if (!option || typeof option !== 'object' || Array.isArray(option)) continue;

    report(isNonEmptyString(option.option_id),
      `Missing option_id: ${optionLabel}`);
    if (isNonEmptyString(option.option_id)) {
      report(!optionIds.has(option.option_id),
        `Duplicate option_id in ${nodeLabel}: ${option.option_id}`);
      optionIds.add(option.option_id);
    }
    report(isNonEmptyString(option.option_text),
      `Missing option_text: ${nodeLabel}/${option.option_id || optionIndex}`);

    const hasNext = isNonEmptyString(option.next_node_id);
    const hasOutcome = isNonEmptyString(option.outcome_id);
    report(hasNext !== hasOutcome,
      `Option must reference exactly one next node or outcome: ${nodeLabel}/${option.option_id || optionIndex}`);
    report(option.triage_level == null || allowedTriageLevels.has(option.triage_level),
      `Unknown triage_level: ${nodeLabel}/${option.option_id || optionIndex} -> ${option.triage_level}`);
    if (hasOutcome && !isNonEmptyString(option.triage_level)) {
      outcomesWithoutTriageLevel.add(option.outcome_id);
    }
  }
}

const actualFlows = new Set(
  nodes.map((node) => node?.flow_kind).filter(isNonEmptyString),
);
report(actualFlows.size === FLOW_DEFINITIONS.length,
  `Flow count differs: expected ${FLOW_DEFINITIONS.length}, found ${actualFlows.size}`);
for (const flowKind of actualFlows) {
  report(documentedFlows.has(flowKind), `Undocumented flow_kind: ${flowKind}`);
}

const allOutcomeIds = new Set();
const flowSummaries = [];

for (const flow of FLOW_DEFINITIONS) {
  const flowNodes = nodes.filter((node) => node?.flow_kind === flow.key);
  const flowNodeIds = new Set(flowNodes.map((node) => node.node_id));
  const entryNode = nodeById.get(flow.entryNodeId);

  report(flowNodes.length === flow.documentedQuestionCount,
    `${flow.key} question count differs: expected ${flow.documentedQuestionCount}, found ${flowNodes.length}`);
  report(Boolean(entryNode),
    `Missing entry node for ${flow.key}: ${flow.entryNodeId}`);
  report(!entryNode || entryNode.flow_kind === flow.key,
    `Entry node belongs to another flow: ${flow.entryNodeId}`);

  const flowOutcomeIds = new Set();
  for (const node of flowNodes) {
    for (const option of node.options || []) {
      if (isNonEmptyString(option.next_node_id)) {
        const target = nodeById.get(option.next_node_id);
        report(Boolean(target),
          `Missing next node: ${node.node_id}/${option.option_id} -> ${option.next_node_id}`);
        report(!target || target.flow_kind === flow.key,
          `Cross-flow transition: ${node.node_id} -> ${option.next_node_id}`);
      }
      if (isNonEmptyString(option.outcome_id)) {
        flowOutcomeIds.add(option.outcome_id);
        allOutcomeIds.add(option.outcome_id);
        report(Boolean(OUTCOME_LABELS[option.outcome_id]),
          `Missing outcome definition: ${node.node_id}/${option.option_id} -> ${option.outcome_id}`);
      }
    }
  }

  report(flowOutcomeIds.size === flow.documentedResultCount,
    `${flow.key} result count differs: expected ${flow.documentedResultCount}, found ${flowOutcomeIds.size}`);

  const reachableNodes = new Set();
  const reachableOutcomes = new Set();
  const queue = [flow.entryNodeId];
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (reachableNodes.has(currentId)) continue;
    const current = nodeById.get(currentId);
    if (!current || current.flow_kind !== flow.key) continue;
    reachableNodes.add(currentId);
    for (const option of current.options || []) {
      if (isNonEmptyString(option.next_node_id)) queue.push(option.next_node_id);
      if (isNonEmptyString(option.outcome_id)) reachableOutcomes.add(option.outcome_id);
    }
  }

  for (const nodeId of flowNodeIds) {
    report(reachableNodes.has(nodeId), `Unreachable question in ${flow.key}: ${nodeId}`);
  }
  for (const outcomeId of flowOutcomeIds) {
    report(reachableOutcomes.has(outcomeId),
      `Unreachable outcome in ${flow.key}: ${outcomeId}`);
  }

  const resultReachability = new Map();
  function everyPathReachesOutcome(nodeId, visiting = new Set()) {
    if (resultReachability.has(nodeId)) return resultReachability.get(nodeId);
    if (visiting.has(nodeId)) return false;

    const node = nodeById.get(nodeId);
    if (!node || node.flow_kind !== flow.key || !Array.isArray(node.options)
      || node.options.length === 0) return false;

    const nextVisiting = new Set(visiting).add(nodeId);
    const reachesOutcome = node.options.every((option) => {
      if (isNonEmptyString(option.outcome_id)) return true;
      if (isNonEmptyString(option.next_node_id)) {
        return everyPathReachesOutcome(option.next_node_id, nextVisiting);
      }
      return false;
    });
    resultReachability.set(nodeId, reachesOutcome);
    return reachesOutcome;
  }

  for (const nodeId of reachableNodes) {
    report(everyPathReachesOutcome(nodeId),
      `A path may fail to reach an outcome in ${flow.key}: ${nodeId}`);
  }

  flowSummaries.push({
    label: flow.label,
    key: flow.key,
    questions: flowNodes.length,
    outcomes: flowOutcomeIds.size,
  });
}

const expectedQuestionCount = FLOW_DEFINITIONS.reduce(
  (sum, flow) => sum + flow.documentedQuestionCount,
  0,
);
const expectedOutcomeCount = FLOW_DEFINITIONS.reduce(
  (sum, flow) => sum + flow.documentedResultCount,
  0,
);
report(nodes.length === expectedQuestionCount,
  `Total question count differs: expected ${expectedQuestionCount}, found ${nodes.length}`);
report(allOutcomeIds.size === expectedOutcomeCount,
  `Total result count differs: expected ${expectedOutcomeCount}, found ${allOutcomeIds.size}`);
for (const outcomeId of Object.keys(OUTCOME_LABELS)) {
  report(allOutcomeIds.has(outcomeId), `Unused outcome definition: ${outcomeId}`);
}
report(data.entry_node_id === FLOW_DEFINITIONS[0].entryNodeId,
  `Top-level entry_node_id differs: expected ${FLOW_DEFINITIONS[0].entryNodeId}, found ${data.entry_node_id}`);

if (outcomesWithoutTriageLevel.size > 0) {
  warnings.push(
    `Outcomes referenced without triage_level: ${[...outcomesWithoutTriageLevel].sort().join(', ')}`,
  );
}

function printWarnings() {
  if (warnings.length === 0) return;
  console.warn(`Flow validation completed with ${warnings.length} warning(s):`);
  for (const warning of warnings) console.warn(`- WARNING: ${warning}`);
}

if (errors.length > 0) {
  console.error(`Flow validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  printWarnings();
  process.exitCode = 1;
} else {
  console.log('Flow validation passed.');
  console.log(`- Flows: ${actualFlows.size}`);
  console.log(`- Question nodes: ${nodes.length}`);
  console.log(`- Outcome nodes: ${allOutcomeIds.size}`);
  for (const flow of flowSummaries) {
    console.log(`  - ${flow.label} (${flow.key}): ${flow.questions} questions, ${flow.outcomes} outcomes`);
  }
  console.log('- Duplicate IDs: 0');
  console.log('- Missing references: 0');
  console.log('- Unreachable questions/outcomes: 0');
  console.log('- Paths without a guaranteed outcome: 0');
  printWarnings();
}
