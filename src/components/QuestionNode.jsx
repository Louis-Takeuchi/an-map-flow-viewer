import { Handle, Position } from '@xyflow/react';

const BORDER_COLORS = {
  red_flag_screen: '#ef4444',
  objective_demographic: '#3b82f6',
  entry_intent: '#22c55e',
  mobility_self_report: '#8b5cf6',
  clinical_history: '#f59e0b',
  subjective_preference: '#6b7280',
  subjective_intensity: '#ec4899',
};

export default function QuestionNode({ data, selected }) {
  const borderColor = BORDER_COLORS[data.responseType] || '#94a3b8';
  const truncated = data.questionText.length > 24
    ? data.questionText.slice(0, 24) + '…'
    : data.questionText;

  return (
    <div
      className="question-node"
      style={{
        borderColor,
        boxShadow: selected ? `0 0 0 2px ${borderColor}` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="node-id">{data.nodeId}</div>
      <div className="node-question">{truncated}</div>
      <div className="node-badge" style={{ backgroundColor: borderColor }}>
        {data.responseType.replace(/_/g, ' ')}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
