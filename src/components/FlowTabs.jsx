import flowData from '../data/flow_v1.0.json';
import { FLOW_DEFINITIONS } from '../config/flowMetadata';

const TABS = FLOW_DEFINITIONS.map((flow) => ({
  ...flow,
  count: flowData.nodes.filter((node) => node.flow_kind === flow.key).length,
}));

export default function FlowTabs({ activeFlow, onChange }) {
  return (
    <div className="flow-tabs">
      {TABS.map((tab) => (
        <button
          type="button"
          key={tab.key}
          className={`tab-btn ${activeFlow === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
          aria-pressed={activeFlow === tab.key}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
