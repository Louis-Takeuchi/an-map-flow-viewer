# Architecture

## System overview

このアプリは、Repository内のJSONをブラウザで読み込む静的なReactアプリです。バックエンドや外部APIは使用しません。

```text
src/data/flow_v1.0.json
  ├─ useFlowGraph ─→ Dagre ─→ React Flow ─→ Overview graph
  └─ useTraceState ────────────────────────→ Trace panel and path
```

## Data flow

1. `flow_v1.0.json`から、選択中の`flow_kind`に属する質問を抽出します。
2. `useFlowGraph`が質問をノード、選択肢をエッジへ変換します。
3. `next_node_id`がある選択肢は次の質問へ、`outcome_id`がある選択肢は生成した結果ノードへ接続します。
4. Dagreが上から下へ並ぶ各ノードの座標を計算します。
5. React Flowがグラフ、ズーム操作、ミニマップを表示します。

## Library roles

- **React**: モード、選択ノード、回答履歴などの画面状態を管理します。
- **React Flow**: 質問・結果ノードと、それらを結ぶエッジを描画します。
- **Dagre**: グラフの座標だけを自動計算します。問診の分岐内容は変更しません。
- **Vite**: 開発サーバーと本番用静的ファイルのビルドを担当します。

結果IDに対応する表示名と色は`src/config/flowPresentation.js`にまとめています。Traceで結果到達後に表示する見出し・案内文は`src/components/TriageResult.jsx`にあり、問診JSONには含まれません。

## Overview and Trace

OverviewとTraceは同じJSONと`useFlowGraph`のグラフを使います。

- **Overview**はフロー全体を表示し、選択したノードのデータを詳細パネルに表示します。
- **Trace**は`useTraceState`に回答履歴を保持し、現在地・通過済み経路・到達結果を強調します。

Traceの履歴はReactのメモリ上だけに存在し、ブラウザを再読み込みすると初期化されます。
