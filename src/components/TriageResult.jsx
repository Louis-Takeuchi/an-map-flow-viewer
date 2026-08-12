import { OUTCOME_LABELS } from '../config/flowPresentation';

const TRIAGE_CONFIG = {
  red: {
    className: 'tr--red',
    label: 'RED',
    subtitle: '緊急の目安',
    title: '今すぐ119番に\n連絡してください',
    guidance: [
      '玄関・入口を開けられるようにする',
      '保険証・お薬手帳を準備する',
      '持病や服用中のお薬があればメモする',
    ],
  },
  yellow: {
    className: 'tr--yellow',
    label: 'YELLOW',
    subtitle: '早めの受診の目安',
    title: 'できるだけ早めの受診を\nご検討ください',
    guidance: [
      '数時間以内の受診をご検討ください',
      '迷ったら #7119（救急安心センター）に電話',
      '15歳未満の場合は #8000（小児救急）',
    ],
  },
  green: {
    className: 'tr--green',
    label: 'GREEN',
    subtitle: '近日中の受診の目安',
    title: '必要に応じて医療機関の\n受診をご検討ください',
    guidance: [
      'お近くの医療機関（一般外来）を受診してください',
      '症状が悪化した場合は再度チェックしてください',
    ],
  },
  white: {
    className: 'tr--white',
    label: 'WHITE',
    subtitle: '経過観察の目安',
    title: 'いま緊急の受診は\n不要な目安です',
    guidance: [
      '自宅で様子を見てください',
      '症状が変わったり強くなった場合は再チェック',
      '迷ったら #7119 に電話',
    ],
  },
};

export default function TriageResult({ outcome, onBack, onReset }) {
  const config = TRIAGE_CONFIG[outcome.triageLevel] || TRIAGE_CONFIG.green;
  const label = OUTCOME_LABELS[outcome.outcomeId] || outcome.outcomeId;

  return (
    <div className={`tr ${config.className}`}>
      <div className="tr-content">
        <p className="tr-subtitle">{config.subtitle}</p>
        <h1 className="tr-title">{config.title}</h1>

        <div className="tr-badge-row">
          <span className="tr-triage-badge">{config.label}</span>
          <span className="tr-outcome-label">{label}</span>
        </div>

        {outcome.triageLevel === 'red' && (
          <div className="tr-call-box">
            <span className="tr-call-number">119</span>
            <span className="tr-call-hint">救急車を要請</span>
          </div>
        )}

        <ul className="tr-guidance">
          {config.guidance.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <div className="tr-meta">
          <p>
            outcome_id: <code>{outcome.outcomeId}</code>
          </p>
        </div>
      </div>

      <div className="tr-actions">
        <button type="button" className="tr-btn" onClick={onBack}>
          ← 戻る
        </button>
        <button type="button" className="tr-btn" onClick={onReset}>
          リセット
        </button>
      </div>
    </div>
  );
}
