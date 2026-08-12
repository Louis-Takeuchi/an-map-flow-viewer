export default function PathBreadcrumbs({ history, currentNodeId, outcome }) {
  if (history.length === 0 && !outcome) {
    return (
      <div className="pb">
        <span className="pb-label">経路</span>
        <div className="pb-path">
          <span className="pb-step pb-step--current">
            <span className="pb-node">{currentNodeId}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pb">
      <span className="pb-label">経路</span>
      <div className="pb-path">
        {history.map((step, i) => (
          <span key={i} className="pb-step">
            <span className="pb-node">{step.nodeId}</span>
            <span className="pb-option">{step.optionText}</span>
            <span className="pb-arrow">&rarr;</span>
          </span>
        ))}
        {outcome ? (
          <span className="pb-step pb-step--outcome">
            <span className="pb-node">{outcome.outcomeId}</span>
          </span>
        ) : (
          <span className="pb-step pb-step--current">
            <span className="pb-node">{currentNodeId}</span>
          </span>
        )}
      </div>
    </div>
  );
}
