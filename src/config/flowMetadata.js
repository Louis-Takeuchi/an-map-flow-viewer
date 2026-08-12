export const FLOW_DEFINITIONS = [
  {
    key: 'emergency',
    label: '救急',
    entryNodeId: 'em_who',
    documentedQuestionCount: 14,
    documentedResultCount: 7,
  },
  {
    key: 'medicine',
    label: '薬',
    entryNodeId: 'mf_screen',
    documentedQuestionCount: 3,
    documentedResultCount: 3,
  },
  {
    key: 'hospital',
    label: '病院案内',
    entryNodeId: 'hp_screen',
    documentedQuestionCount: 5,
    documentedResultCount: 2,
  },
];

export const FLOW_DEFINITION_BY_KEY = Object.fromEntries(
  FLOW_DEFINITIONS.map((flow) => [flow.key, flow]),
);
