import { TRIAGE_PRESENTATION, UNSPECIFIED_PRESENTATION } from '../config/flowPresentation';

export default function TriageResult({ outcome, onBack, onReset }) {
  const badge = TRIAGE_PRESENTATION[outcome.triageLevel] || UNSPECIFIED_PRESENTATION;
  return (
    <div className={`tr tr--${outcome.triageLevel || 'unspecified'}`}>
      <div className="tr-content">
        <p className="tr-subtitle">公開JSONの結果定義</p>
        <h1 className="tr-title">{outcome.label}</h1>
        <span className="tr-triage-badge">
          {badge.label}{badge.description ? ` / ${badge.description}` : ''}
        </span>
        {outcome.hint && <p className="tr-guidance">{outcome.hint}</p>}
        <div className="tr-meta">
          <p>outcome_id: <code>{outcome.outcomeId}</code></p>
          {outcome.action && <p>action: <code>{outcome.action}</code></p>}
          {outcome.reason && <p>reason: <code>{outcome.reason}</code></p>}
          <p>protocol: <code>{outcome.protocolVersion}</code></p>
        </div>
        {outcome.action && (
          <p className="tr-scope">action は本体の処理先を示します。Viewer のトレースは、この結果定義までを表示します。</p>
        )}
      </div>
      <div className="tr-actions">
        <button type="button" className="tr-btn" onClick={onBack}>← 戻る</button>
        <button type="button" className="tr-btn" onClick={onReset}>リセット</button>
      </div>
    </div>
  );
}
