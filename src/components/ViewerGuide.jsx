import {
  DEFAULT_OUTCOME_COLOR,
  OTHER_OUTCOME_EDGE_COLOR,
  TRIAGE_PRESENTATION,
} from '../config/flowPresentation';

const LEGEND_ITEMS = [
  { label: 'RED', color: TRIAGE_PRESENTATION.red.color },
  { label: 'YELLOW', color: TRIAGE_PRESENTATION.yellow.color },
  { label: 'GREEN', color: TRIAGE_PRESENTATION.green.color },
  { label: 'WHITE', color: TRIAGE_PRESENTATION.white.color },
  { label: 'その他の結果', color: DEFAULT_OUTCOME_COLOR },
  { label: '相談結果への線', color: OTHER_OUTCOME_EDGE_COLOR },
];

export default function ViewerGuide({ mode }) {
  return (
    <section className="viewer-guide" aria-label="操作説明">
      <p className="viewer-guide__text">
        {mode === 'overview'
          ? '全体構造を表示しています。質問・結果ノードを選択すると詳細を確認できます。'
          : '回答を一つずつ選び、開始点から結果までの経路を確認できます。'}
      </p>
      {mode === 'overview' && (
        <div className="viewer-legend" aria-label="表示色の凡例">
          <span className="viewer-legend__label">結果表示</span>
          {LEGEND_ITEMS.map((item) => (
            <span className="viewer-legend__item" key={item.label}>
              <span
                className="viewer-legend__swatch"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <p className="viewer-guide__scope">
        問診構造を確認するための静的viewerです。単体での医療判断には使用しません。
      </p>
    </section>
  );
}
