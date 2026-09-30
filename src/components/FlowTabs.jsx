import { FLOW_DEFINITIONS } from '../config/flowMetadata';

export default function FlowTabs({ activeFlow, onChange }) {
  return (
    <div className="flow-tabs">
      {FLOW_DEFINITIONS.map((tab) => (
        <button
          type="button"
          key={tab.key}
          className={`tab-btn ${activeFlow === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
          aria-pressed={activeFlow === tab.key}
        >
          {tab.label} ({tab.questionCount})
        </button>
      ))}
    </div>
  );
}
