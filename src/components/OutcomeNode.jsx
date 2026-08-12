import { Handle, Position } from '@xyflow/react';
import {
  DEFAULT_OUTCOME_COLOR,
  TRIAGE_PRESENTATION,
} from '../config/flowPresentation';

export default function OutcomeNode({ data }) {
  const presentation = TRIAGE_PRESENTATION[data.triageLevel];
  const bg = presentation?.color || DEFAULT_OUTCOME_COLOR;
  const textColor = presentation?.textColor || '#fff';

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
