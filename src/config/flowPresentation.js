export const TRIAGE_PRESENTATION = {
  red: {
    label: 'RED',
    color: '#ef4444',
    edgeColor: '#dc2626',
    textColor: '#fff',
  },
  yellow: {
    label: 'YELLOW',
    color: '#f59e0b',
    edgeColor: '#d97706',
    textColor: '#fff',
  },
  green: {
    label: 'GREEN',
    color: '#22c55e',
    edgeColor: '#16a34a',
    textColor: '#fff',
  },
  white: {
    label: 'WHITE',
    color: '#e5e7eb',
    edgeColor: '#94a3b8',
    textColor: '#374151',
  },
};

export const UNSPECIFIED_PRESENTATION = {
  label: 'UNSPECIFIED',
  description: '未設定',
  color: '#64748b',
  edgeColor: '#64748b',
  textColor: '#fff',
};

export const DEFAULT_OUTCOME_COLOR = UNSPECIFIED_PRESENTATION.color;
export const OTHER_OUTCOME_EDGE_COLOR = '#7c3aed';

export function getOutcomeEdgeColor(outcomeId, triageLevel) {
  if (!triageLevel) return UNSPECIFIED_PRESENTATION.edgeColor;
  if (outcomeId === 'out_mental_consult' || outcomeId === 'out_phone_consult') {
    return OTHER_OUTCOME_EDGE_COLOR;
  }
  return TRIAGE_PRESENTATION[triageLevel]?.edgeColor
    || UNSPECIFIED_PRESENTATION.edgeColor;
}
