import { Handle, Position } from '@xyflow/react';

const TRIAGE_COLORS = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e',
  white: '#e5e7eb',
};

export default function OutcomeNode({ data }) {
  const bg = TRIAGE_COLORS[data.triageLevel] || '#94a3b8';
  const textColor = data.triageLevel === 'white' ? '#374151' : '#fff';

  return (
    <div
      className="outcome-node"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="outcome-label">{data.label}</div>
    </div>
  );
}
