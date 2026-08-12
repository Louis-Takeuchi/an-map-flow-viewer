/**
 * Ported from citizen FlowRunner markup.
 * Visual structure only — no zustand, no API calls.
 */
export default function QuestionPanel({
  node,
  stepIndex,
  totalNodes,
  onSelect,
  onBack,
  onReset,
  canGoBack,
}) {
  if (!node) return null;

  const progress = Math.min(
    100,
    Math.round(((stepIndex + 1) / totalNodes) * 100),
  );

  return (
    <div className="qp">
      {/* Toolbar — citizen FlowRunner: progress bar + nav */}
      <div className="qp-toolbar">
        <button type="button" className="qp-btn-nav" onClick={onReset}>
          リセット
        </button>
        {canGoBack && (
          <button
            type="button"
            className="qp-btn-nav"
            onClick={onBack}
            aria-label="戻る"
          >
            ←
          </button>
        )}
        <div className="qp-progress-track">
          <div className="qp-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="qp-step-count">
          {stepIndex + 1}/{totalNodes}
        </span>
      </div>

      {/* Question card — citizen FlowRunner: rounded card + choices */}
      <div className="qp-card">
        <p className="qp-node-id">{node.node_id}</p>
        <h2 className="qp-question">{node.question_text}</h2>

        <div className="qp-choices">
          {node.options.map((opt) => {
            let variant = '';
            if (
              opt.triage_level === 'red' ||
              opt.outcome_id === 'out_escalate' ||
              opt.outcome_id === 'hp_escalate'
            ) {
              variant = 'qp-choice--red';
            } else if (opt.triage_level === 'yellow') {
              variant = 'qp-choice--yellow';
            } else if (opt.triage_level === 'green') {
              variant = 'qp-choice--green';
            } else if (opt.triage_level === 'white') {
              variant = 'qp-choice--white';
            }

            return (
              <button
                key={opt.option_id}
                type="button"
                className={`qp-choice ${variant}`}
                onClick={() => onSelect(opt.option_id)}
              >
                {opt.option_text}
              </button>
            );
          })}
        </div>
      </div>

      <p className="qp-meta">
        response_type: <code>{node.response_type}</code>
      </p>
    </div>
  );
}
