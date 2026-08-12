import { TRIAGE_PRESENTATION } from '../config/flowPresentation';

export default function DetailPanel({ node, onClose }) {
  if (!node) return null;

  const d = node.data;

  // Outcome node
  if (node.type === 'outcome') {
    const badge = TRIAGE_PRESENTATION[d.triageLevel];
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
          {badge && (
            <div className="detail-row">
              <span className="detail-label">トリアージ</span>
              <span
                className="triage-badge"
                style={{ backgroundColor: badge.color, color: badge.textColor }}
              >
                {badge.label}
              </span>
            </div>
          )}
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
          <span className="detail-label">response_type</span>
          <code>{d.responseType}</code>
        </div>
        <div className="detail-section">
          <h4>質問文</h4>
          <p className="question-full">{d.questionText}</p>
        </div>
        <div className="detail-section">
          <h4>選択肢</h4>
          <table className="options-table">
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
                  : null;
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
          </table>
        </div>
      </div>
    </div>
  );
}
