const TABS = [
  { key: 'emergency', label: 'Emergency', count: 14 },
  { key: 'medicine', label: 'Medicine', count: 3 },
  { key: 'hospital', label: 'Hospital', count: 5 },
];

export default function FlowTabs({ activeFlow, onChange }) {
  return (
    <div className="flow-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${activeFlow === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
