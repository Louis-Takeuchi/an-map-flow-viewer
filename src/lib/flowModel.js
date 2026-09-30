const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const TRIAGE_LEVELS = new Set(['red', 'yellow', 'green', 'white']);
const ACTIONS = new Set(['redirect_emergency', 'hospital_search', 'medicine_complete', 'phone_consultation']);

// Validate the source before adapting it. Unknown destinations must never turn
// into successful terminal results just because they are not question IDs.
export function validateProtocols(protocols) {
  const errors = [];
  const questionIds = new Set();
  const outcomeIds = new Set();
  const report = (condition, message) => { if (!condition) errors.push(message); };

  for (const [kind, flow] of Object.entries(protocols)) {
    report(isObject(flow), `${kind}: protocol must be an object`);
    if (!isObject(flow)) continue;
    report(flow.id === kind, `${kind}: protocol id mismatch`);
    report(isText(flow.protocol_version), `${kind}: missing protocol_version`);
    report(isObject(flow.questions), `${kind}: questions must be an object`);
    report(isObject(flow.outcomes), `${kind}: outcomes must be an object`);
    if (!isObject(flow.questions) || !isObject(flow.outcomes)) continue;
    const { questions, outcomes } = flow;
    report(isText(flow.start) && Object.hasOwn(questions, flow.start), `${kind}: missing start question`);
    report(Object.keys(outcomes).length > 0, `${kind}: no outcomes`);

    for (const [id, outcome] of Object.entries(outcomes)) {
      report(!outcomeIds.has(id) && !questionIds.has(id) && !Object.hasOwn(questions, id), `${kind}: duplicate ID ${id}`);
      outcomeIds.add(id);
      report(isObject(outcome) && isText(outcome.label), `${id}: missing outcome label`);
      if (!isObject(outcome)) continue;
      report(Boolean(outcome.triage) !== Boolean(outcome.action), `${id}: specify exactly one triage or action`);
      report(outcome.triage == null || TRIAGE_LEVELS.has(outcome.triage), `${id}: unknown triage ${outcome.triage}`);
      report(outcome.action == null || ACTIONS.has(outcome.action), `${id}: unknown action ${outcome.action}`);
      for (const field of ['hint', 'reason']) {
        report(outcome[field] == null || typeof outcome[field] === 'string', `${id}: ${field} must be text`);
      }
    }

    for (const [id, question] of Object.entries(questions)) {
      report(!questionIds.has(id) && !outcomeIds.has(id), `${kind}: duplicate ID ${id}`);
      questionIds.add(id);
      report(isObject(question) && isText(question.text), `${id}: missing question text`);
      if (!isObject(question)) continue;
      report(question.subtitle == null || typeof question.subtitle === 'string', `${id}: subtitle must be text`);
      report(question.evidence == null || isObject(question.evidence), `${id}: evidence must be an object`);
      if (isObject(question.evidence)) {
        for (const field of ['source', 'url', 'section', 'checked_at']) {
          report(question.evidence[field] == null || typeof question.evidence[field] === 'string', `${id}: evidence.${field} must be text`);
        }
      }
      report(Array.isArray(question.choices) && question.choices.length > 0, `${id}: no choices`);
      if (!Array.isArray(question.choices)) continue;
      for (const [index, choice] of question.choices.entries()) {
        const label = `${id}/choice_${index + 1}`;
        report(isObject(choice) && isText(choice.label), `${label}: missing label`);
        if (!isObject(choice)) continue;
        report(isText(choice.next) && (Object.hasOwn(questions, choice.next) || Object.hasOwn(outcomes, choice.next)), `${label}: missing destination ${choice.next}`);
        report(choice.data == null || isObject(choice.data), `${label}: data must be an object`);
      }
    }

    const reached = new Set();
    const visiting = new Set();
    const visit = (id) => {
      if (visiting.has(id)) { errors.push(`${kind}: cycle at ${id}`); return; }
      if (reached.has(id)) return;
      reached.add(id);
      if (!Object.hasOwn(questions, id)) return;
      visiting.add(id);
      const choices = questions[id]?.choices;
      if (Array.isArray(choices)) choices.forEach((choice) => visit(choice?.next));
      visiting.delete(id);
    };
    visit(flow.start);
    for (const id of [...Object.keys(questions), ...Object.keys(outcomes)]) {
      report(reached.has(id), `${kind}: unreachable ${id}`);
    }
  }
  return errors;
}

export function normalizeFlows(protocols) {
  const errors = validateProtocols(protocols);
  if (errors.length) throw new Error(errors.join('\n'));
  return {
    nodes: Object.entries(protocols).flatMap(([kind, flow]) =>
      Object.entries(flow.questions).map(([id, question]) => ({
        node_id: id,
        flow_kind: kind,
        // A viewer UI type, not a medical classification from the source.
        response_type: 'single_choice',
        question_text: question.text,
        subtitle: question.subtitle || null,
        evidence: question.evidence || null,
        protocol_version: flow.protocol_version,
        options: question.choices.map((choice, index) => {
          const outcome = flow.outcomes[choice.next];
          return {
            option_id: `choice_${index + 1}`,
            option_text: choice.label,
            next_node_id: outcome ? null : choice.next,
            outcome_id: outcome ? choice.next : null,
            triage_level: outcome?.triage || null,
            action: outcome?.action || null,
            data: choice.data || {},
          };
        }),
      }))),
    outcomes: Object.fromEntries(Object.entries(protocols).flatMap(([kind, flow]) =>
      Object.entries(flow.outcomes).map(([id, outcome]) => [id, {
        ...outcome,
        outcomeId: id,
        triageLevel: outcome.triage || null,
        flowKind: kind,
        protocolVersion: flow.protocol_version,
      }]))),
  };
}
