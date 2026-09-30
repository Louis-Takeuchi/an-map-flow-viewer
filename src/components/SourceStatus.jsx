import source from '../data/source.json';
import { FLOW_DEFINITION_BY_KEY } from '../config/flowMetadata';

export default function SourceStatus({ flowKind }) {
  const flow = FLOW_DEFINITION_BY_KEY[flowKind];
  const verifiedAt = new Date(source.verified_at).toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return (
    <section className="source-status" aria-label="データの出典と確認日">
      <span>公開版データ / <time dateTime={source.verified_at}>{verifiedAt}</time> 確認</span>
      <code>{flow.protocolVersion}</code>
      <span>{flow.questionCount} 質問・{flow.resultCount} 結果</span>
      <a href={source.flows[flowKind].url} target="_blank" rel="noreferrer">配信元JSON ↗</a>
      <span className="source-status__note">確認時点の保存データ</span>
    </section>
  );
}
