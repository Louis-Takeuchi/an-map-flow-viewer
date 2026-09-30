import { protocols } from '../data/flowData';

export const FLOW_DEFINITIONS = [
  {
    key: 'emergency',
    label: '救急',
  },
  {
    key: 'medicine',
    label: '薬',
  },
  {
    key: 'hospital',
    label: '病院案内',
  },
].map((flow) => ({
  ...flow,
  entryNodeId: protocols[flow.key].start,
  protocolVersion: protocols[flow.key].protocol_version,
  questionCount: Object.keys(protocols[flow.key].questions).length,
  resultCount: Object.keys(protocols[flow.key].outcomes).length,
}));

export const FLOW_DEFINITION_BY_KEY = Object.fromEntries(
  FLOW_DEFINITIONS.map((flow) => [flow.key, flow]),
);
