# Anshin Map Flow Viewer

安心マップの問診・トリアージフローを、俯瞰・トレースの2方式で可視化するWebアプリです。

## 1. Overview

このRepositoryは、受診案内サービス「安心マップ」の質問、回答、次の質問、最終的な案内のつながりを、人間が視覚的に確認するための静的フロービューワーです。JSONとして定義された問診フローをブラウザ上に表示し、全体構造と個別の回答経路を確認できます。

安心マップ本体や医療診断システムではありません。

## 2. Why this viewer exists

問診ロジックを実装コードの中だけに置くと、個々の分岐と全体像を同時に確認することが難しくなります。このviewerは、安心マップの設計をブラックボックスにせず、第三者が全体構造と個別経路の両方を確認できる状態にするために作成しました。

## 3. What you can inspect

- 救急・薬・病院案内の3種類のフロー
- すべての質問ノードと質問文
- 各質問の選択肢、遷移先、最終結果
- フロー全体の分岐構造
- 回答を一つずつ選んだ場合の個別経路

## 4. Two viewing modes

| モード | 確認できること |
| --- | --- |
| Overview / 俯瞰 | 選択中のフロー全体をグラフで表示します。ノードを選ぶと、質問文、選択肢、遷移先、結果IDを確認できます。 |
| Trace / トレース | 画面上で回答を選び、開始ノードから一つの結果までの経路をたどります。通過したノードとエッジが強調されます。 |

## 5. Flow structure

数値は[`src/data/flow_v1.0.json`](src/data/flow_v1.0.json)から集計しています。

| フロー | 開始ノード | 質問ノード数 | 結果ノード数 |
| --- | --- | ---: | ---: |
| 救急（`emergency`） | `em_who` | 14 | 7 |
| 薬（`medicine`） | `mf_screen` | 3 | 3 |
| 病院案内（`hospital`） | `hp_screen` | 5 | 2 |
| **合計** | — | **22** | **12** |

結果ノード数は、各フロー内で参照される一意な`outcome_id`の数です。質問から次の質問へは`next_node_id`、結果へは`outcome_id`で接続します。

## 6. Result categories

実装されている結果IDと表示名は次のとおりです。

| フロー | 結果カテゴリ |
| --- | --- |
| 救急 | 119番通報、急性期受診、往診・オンライン診療、一般外来、セルフケア、精神科相談、#7119 / #8000 |
| 薬 | 救急フローへ、完了、病院紹介 |
| 病院案内 | 救急フローへ、受診案内完了 |

RED・YELLOW・GREEN・WHITEなどの色は、グラフ上で結果カテゴリを識別しやすくするための表示です。色だけに依存せず、結果名とIDも併記しています。

## 7. Technical architecture

```text
JSON flow data
  → React components
  → Dagre automatic layout
  → React Flow visualization
```

- **React**: 画面と回答状態の管理
- **Vite**: ローカル開発と本番用ビルド
- **React Flow (`@xyflow/react`)**: ノード、エッジ、ズーム、ミニマップの表示
- **Dagre (`@dagrejs/dagre`)**: 上から下へ並ぶグラフ座標の計算
- **JSON**: 質問、選択肢、遷移先、結果IDの定義

詳しくは[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)を参照してください。

## 8. Data and privacy

現在の実装は、Repository内の静的JSONを読み込んで表示します。

- バックエンドAPIへの通信はありません。
- 入力した回答をサーバーや外部サービスへ送信しません。
- 医療・診断情報を`localStorage`、Cookie、データベース等へ保存しません。
- Trace中の回答履歴はReactのメモリ上だけに保持され、再読み込みすると消えます。

詳細は[`docs/SAFETY_AND_SCOPE.md`](docs/SAFETY_AND_SCOPE.md)を参照してください。

## 9. Scope and limitations

このRepositoryは問診フローを可視化するための技術資料であり、医療診断を提供することを目的としたものではありません。

表示されるフローは、安心マップの設計を説明・確認するためのものであり、このRepository単体を医療判断に利用することを想定していません。医学的妥当性や実運用時の安全性を、このRepositoryが検証・証明するものではありません。

`triage_level`が設定されていない結果では、現在のTrace結果画面がGREEN用の表示設定へフォールバックします。構造確認では結果名と`outcome_id`を参照してください。この表示方針の変更には、設計・内容面の確認が必要です。

## 10. Run locally

Node.js `^18.0.0 || >=20.0.0`とnpmが必要です。

```bash
git clone https://github.com/Louis-Takeuchi/an-map-flow-viewer.git
cd an-map-flow-viewer
npm install
npm run dev
```

構造検証と本番用ビルドは次のコマンドで実行できます。

```bash
npm run validate:flows
npm run build
```

## 11. Repository structure

```text
.
├── docs/                   # 構成・データ形式・対象範囲の説明
├── scripts/
│   └── validate-flows.mjs # JSONの構造整合性検証
├── src/
│   ├── components/        # グラフ、詳細、トレースUI
│   ├── config/            # フローと表示用の共通定義
│   ├── data/
│   │   └── flow_v1.0.json # 問診フローの静的データ
│   ├── hooks/             # グラフ生成とトレース状態
│   └── App.jsx
└── package.json
```

JSONの各フィールドは[`docs/FLOW_DATA_FORMAT.md`](docs/FLOW_DATA_FORMAT.md)で説明しています。

## 12. Status

**Current status: static flow viewer / prototype**

- JSONベースの3フローを表示
- OverviewとTraceを実装済み
- 実運用API、アカウント、医療データ保存は未実装
- 医学的妥当性や運用上の安全性の検証は、このRepositoryの範囲外

## 13. Related project

安心マップは、質問への回答から受診案内までの流れを設計するプロジェクトです。このRepositoryには、そのうち問診・分岐構造を確認するviewerとサンプルデータだけを収録しており、安心マップ本体のバックエンド、医療機関検索、運用環境は含みません。
