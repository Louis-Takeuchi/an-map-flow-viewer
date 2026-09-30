import test from 'node:test';
import assert from 'node:assert/strict';
import { readSources } from './lib/flowSources.mjs';
import { normalizeFlows, validateProtocols } from '../src/lib/flowModel.js';

const { protocols } = await readSources();
const normalized = normalizeFlows(protocols);

test('all published questions, choices and terminal metadata survive adaptation', () => {
  assert.equal(normalized.nodes.length, Object.values(protocols).reduce((total, flow) => total + Object.keys(flow.questions).length, 0));
  assert.equal(Object.keys(normalized.outcomes).length, Object.values(protocols).reduce((total, flow) => total + Object.keys(flow.outcomes).length, 0));
  for (const [kind, flow] of Object.entries(protocols)) {
    for (const [id, question] of Object.entries(flow.questions)) {
      const node = normalized.nodes.find((candidate) => candidate.node_id === id);
      assert.equal(node.flow_kind, kind);
      assert.equal(node.question_text, question.text);
      assert.equal(node.subtitle, question.subtitle || null);
      assert.deepEqual(node.evidence, question.evidence || null);
      assert.equal(node.protocol_version, flow.protocol_version);
      assert.equal(node.options.length, question.choices.length);
      assert.equal(new Set(node.options.map((option) => option.option_id)).size, node.options.length);
      question.choices.forEach((choice, index) => {
        const option = node.options[index];
        assert.equal(option.option_text, choice.label);
        assert.deepEqual(option.data, choice.data || {});
        assert.equal(option.next_node_id || option.outcome_id, choice.next);
        assert.equal(option.triage_level, flow.outcomes[choice.next]?.triage || null);
        assert.equal(option.action, flow.outcomes[choice.next]?.action || null);
      });
    }
    for (const [id, outcome] of Object.entries(flow.outcomes)) {
      for (const [key, value] of Object.entries(outcome)) assert.deepEqual(normalized.outcomes[id][key], value);
    }
  }
});

test('every possible source path reaches the same result through the viewer model', () => {
  let paths = 0;
  const nodes = new Map(normalized.nodes.map((node) => [node.node_id, node]));
  for (const flow of Object.values(protocols)) {
    const walk = (id) => {
      flow.questions[id].choices.forEach((choice, index) => {
        const option = nodes.get(id).options[index];
        if (flow.outcomes[choice.next]) {
          assert.equal(option.next_node_id, null);
          assert.equal(option.outcome_id, choice.next);
          paths++;
        } else {
          assert.equal(option.outcome_id, null);
          assert.equal(option.next_node_id, choice.next);
          walk(choice.next);
        }
      });
    };
    walk(flow.start);
  }
  assert.ok(paths > 100, `${paths} terminal paths checked`);
});

test('consultation and home-visit outcomes keep their own guidance', () => {
  assert.equal(normalized.outcomes.out_yellow.hint, '2時間以内の受診をご検討ください');
  assert.equal(normalized.outcomes.out_yellow_home.hint, '往診・オンライン診療を優先で検討');
  assert.equal(normalized.outcomes.out_mental_consult.label, '専門の相談窓口をご案内します');
  assert.equal(normalized.outcomes.out_phone_consult.triageLevel, null);
  assert.equal(normalized.outcomes.out_phone_consult.action, 'phone_consultation');
});

for (const [label, mutate, expected] of [
  ['missing destination', (p) => { p.medicine.questions.mf_screen.choices[0].next = 'missing'; }, /missing destination/],
  ['cross-flow transition', (p) => { p.medicine.questions.mf_screen.choices[0].next = 'em_who'; }, /missing destination/],
  ['cycle', (p) => { p.medicine.questions.mf_gp.choices[0].next = 'mf_screen'; }, /cycle/],
  ['unreachable question', (p) => { p.medicine.questions.orphan = structuredClone(p.medicine.questions.mf_gp); }, /unreachable/],
  ['duplicate global ID', (p) => { p.medicine.questions.em_who = structuredClone(p.medicine.questions.mf_gp); }, /duplicate ID/],
  ['empty choices', (p) => { p.medicine.questions.mf_gp.choices = []; }, /no choices/],
  ['unknown triage', (p) => { p.emergency.outcomes.out_red.triage = 'blue'; }, /unknown triage/],
  ['unknown action', (p) => { p.medicine.outcomes.out_done.action = 'unknown'; }, /unknown action/],
  ['ambiguous outcome', (p) => { p.medicine.outcomes.out_done.triage = 'green'; }, /exactly one/],
  ['missing version', (p) => { delete p.medicine.protocol_version; }, /missing protocol_version/],
  ['invalid display metadata', (p) => { p.emergency.outcomes.out_red.hint = {}; }, /hint must be text/],
]) {
  test(`rejects ${label} before the snapshot is used`, () => {
    const broken = structuredClone(protocols);
    mutate(broken);
    assert.match(validateProtocols(broken).join('\n'), expected);
    assert.throws(() => normalizeFlows(broken), expected);
  });
}
