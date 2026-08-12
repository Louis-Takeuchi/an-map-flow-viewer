# Architecture

## System overview

このviewerは、Repository内のJSONをブラウザで読み込む静的なReactアプリです。実運用バックエンドや外部APIには接続しません。

```text
src/data/flow_v1.0.json
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

1. `flow_v1.0.json`から、選択中の`flow_kind`に属する質問を抽出します。
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

結果IDの表示名と色は`src/config/flowPresentation.js`、各フローの開始点は`src/config/flowMetadata.js`にあります。Trace履歴はブラウザの永続ストレージへ保存せず、ページ再読み込みで初期化されます。
