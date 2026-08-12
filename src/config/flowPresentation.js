export const OUTCOME_LABELS = {
  out_red: '119番通報',
  out_yellow: '急性期受診',
  out_yellow_home: '往診・オンライン診療',
  out_green: '一般外来',
  out_white: 'セルフケア',
  out_mental_consult: '精神科相談',
  out_phone_consult: '#7119 / #8000',
  out_done: '完了',
  out_escalate: '救急フローへ',
  out_hospital: '病院紹介',
  hp_escalate: '救急フローへ',
  hp_done: '受診案内完了',
};

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
