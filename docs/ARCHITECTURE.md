# Architecture

## System overview

このviewerは、Repository内のJSONをブラウザで読み込む静的なReactアプリです。実運用バックエンドや外部APIには接続しません。

```text
src/data/flows/{emergency,medicine,hospital}.json
          ↓
        React
          ↓
useFlowGraphによるnode / edge生成
          ↓
     Dagre layout
          ↓
      React Flow
          ↓
 Overview / Trace / Detail
```

## Data flow

1. 公開版JSONを`src/lib/flowModel.js`で検証・変換し、`src/data/flowData.js`を通して読み込みます。質問文、補足、出典、選択肢の順番・文言・data、遷移先、結果定義を保持します。
2. `useFlowGraph`が質問をnode、選択肢をedgeへ変換します。
3. `next_node_id`は次の質問へ、`outcome_id`は生成した結果nodeへ接続します。
4. Dagreが上から下へ並ぶ座標を計算します。質問・選択肢・遷移は変更しません。
5. React Flowがグラフ、ズーム、ミニマップを表示します。

## Component roles

- `App` / `FlowView`: フロー・表示モード・選択nodeを管理します。
- `useFlowGraph`: JSONからReact Flow用のnodeとedgeを生成し、Dagreを適用します。
- `useTraceState`: 現在の質問、回答履歴、到達結果をReact stateで保持します。
- `FlowCanvas`: Overview／Trace共通のグラフを描画します。
- `DetailPanel`: 選択した質問または結果の構造データを表示します。
- `TraceView`: 具体的な回答経路と到達結果を強調します。

結果名と案内文は公開JSONの`outcomes`、色は`src/config/flowPresentation.js`にあります。各フローの開始点・質問数・結果数は`src/config/flowMetadata.js`が公開JSONから取得します。Trace履歴はブラウザの永続ストレージへ保存せず、ページ再読み込みで初期化されます。

## 更新と出典

`npm run check:flows`は保存JSONと公開版の内容全体を照合します。`npm run sync:flows`は公開JSONをすべて取得し構造検証した後、保存データと`source.json`を更新します。実行時のViewerにはネットワーク取得を追加しません。`SourceStatus`がフローごとのプロトコル版、確認日、配信元JSONへのリンクを表示します。

Traceの終点はJSONの結果定義です。救急フローへの切り替え、医療機関検索、結果後の条件別表示など、本体のクライアント・バックエンド処理は実行しません。
