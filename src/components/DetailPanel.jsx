import {
  TRIAGE_PRESENTATION,
  UNSPECIFIED_PRESENTATION,
} from '../config/flowPresentation';

export default function DetailPanel({ node, onClose }) {
  if (!node) return null;

  const d = node.data;

  // Outcome node
  if (node.type === 'outcome') {
    const badge = TRIAGE_PRESENTATION[d.triageLevel]
      || UNSPECIFIED_PRESENTATION;
    return (
      <div className="detail-panel">
        <div className="panel-header">
          <h3>Outcome</h3>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="詳細を閉じる"
          >
            ×
          </button>
        </div>
        <div className="panel-body">
          <div className="detail-row">
            <span className="detail-label">ID</span>
            <code>{d.outcomeId}</code>
          </div>
          <div className="detail-row">
            <span className="detail-label">ラベル</span>
            <span>{d.label}</span>
          </div>
          {d.hint && <div className="detail-section"><h4>案内文</h4><p>{d.hint}</p></div>}
          {d.action && <div className="detail-section"><h4>action</h4><code>{d.action}</code></div>}
          {d.reason && <div className="detail-section"><h4>reason</h4><code>{d.reason}</code></div>}
          <div className="detail-section"><h4>protocol_version</h4><code>{d.protocolVersion}</code></div>
          <div className="detail-row">
            <span className="detail-label">トリアージ</span>
            <span
              className="triage-badge"
              style={{ backgroundColor: badge.color, color: badge.textColor }}
            >
              {badge.label}
              {badge.description ? ` / ${badge.description}` : ''}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Question node
  return (
    <div className="detail-panel">
      <div className="panel-header">
        <h3>{d.nodeId}</h3>
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="詳細を閉じる"
        >
          ×
        </button>
      </div>
      <div className="panel-body">
        <div className="detail-row">
          <span className="detail-label">protocol</span>
          <code>{d.protocolVersion}</code>
        </div>
        <div className="detail-section">
          <h4>質問文</h4>
          <p className="question-full">{d.questionText}</p>
          {d.subtitle && <p className="detail-subtitle">{d.subtitle}</p>}
        </div>
        {d.evidence && (
          <div className="detail-section">
            <h4>公開JSONに記載された出典</h4>
            <p>{/^https?:\/\//.test(d.evidence.url || '')
              ? <a href={d.evidence.url} target="_blank" rel="noreferrer">{d.evidence.source}</a>
              : d.evidence.source}</p>
            {d.evidence.section && <p>{d.evidence.section}</p>}
            {d.evidence.checked_at && <p>出典の確認日: {d.evidence.checked_at}</p>}
          </div>
        )}
        <div className="detail-section">
          <h4>選択肢</h4>
          <div className="options-scroll"><table className="options-table">
            <thead>
              <tr>
                <th>選択肢</th>
                <th>遷移先</th>
                <th>トリアージ</th>
                <th>アウトカム</th>
              </tr>
            </thead>
            <tbody>
              {d.options.map((opt) => {
                const badge = opt.triage_level
                  ? TRIAGE_PRESENTATION[opt.triage_level]
                  : (opt.outcome_id ? UNSPECIFIED_PRESENTATION : null);
                return (
                  <tr key={opt.option_id}>
                    <td>{opt.option_text}</td>
                    <td>
                      <code>{opt.next_node_id || '—'}</code>
                    </td>
                    <td>
                      {badge ? (
                        <span
                          className="triage-badge"
                          style={{ backgroundColor: badge.color, color: badge.textColor }}
                        >
                          {badge.label}
                          {badge.description ? ` / ${badge.description}` : ''}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <code>{opt.outcome_id || '—'}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
        <div className="detail-section">
          <h4>選択肢の data（公開JSON）</h4>
          {d.options.map((opt) => (
            <div className="choice-data" key={opt.option_id}>
              <p>{opt.option_text}</p>
              <code>{JSON.stringify(opt.data)}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
