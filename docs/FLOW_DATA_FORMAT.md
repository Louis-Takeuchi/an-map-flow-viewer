# Flow data format

問診データは[`src/data/flow_v1.0.json`](../src/data/flow_v1.0.json)の`nodes`配列にあります。この形式は質問と遷移の構造を表し、医学的妥当性を記述・判定するものではありません。

## Top-level fields

| フィールド | 内容 |
| --- | --- |
| `entry_node_id` | JSONに記録された救急フローの開始node ID |
| `nodes` | 3フロー分のquestion node配列 |

各フローの開始nodeは[`src/config/flowMetadata.js`](../src/config/flowMetadata.js)に定義しています。

## Question node

```json
{
  "node_id": "mf_gp",
  "response_type": "clinical_history",
  "question_text": "かかりつけ医（いつも通う医療機関）はありますか？",
  "flow_kind": "medicine",
  "options": [
    {
      "option_id": "regular",
      "option_text": "いつも通っているかかりつけ医がある",
      "next_node_id": null,
      "outcome_id": "out_done"
    }
  ]
}
```

| フィールド | 内容 |
| --- | --- |
| `node_id` | Repository全体で一意なquestion ID |
| `response_type` | 質問の表示上の分類 |
| `question_text` | 表示する質問文 |
| `flow_kind` | `emergency`、`medicine`、`hospital`のいずれか |
| `options` | 1件以上のchoice配列 |

## Choice and transition

各choiceは`option_id`と`option_text`を持ち、次のquestionまたはoutcomeのどちらか一方へ接続します。

- `next_node_id`が文字列: 同じフロー内のquestionへ進みます。
- `outcome_id`が文字列: 問診を終了し、その結果へ進みます。
- `triage_level`がある場合: RED／YELLOW／GREEN／WHITEの表示設定に使います。

OutcomeはJSON内の独立したnode objectではありません。choiceが参照する一意な`outcome_id`ごとに、viewerが結果nodeを生成します。表示名は[`src/config/flowPresentation.js`](../src/config/flowPresentation.js)の`OUTCOME_LABELS`に定義します。

## Structural validation

`npm run validate:flows`は次を検査します。

- 必須フィールドと空でないchoice
- question IDと同一question内のchoice IDの重複
- `flow_kind`、開始node、遷移先question、outcome表示定義の存在
- choiceが`next_node_id`／`outcome_id`のちょうど一方を参照すること
- 到達不能なquestion／outcomeがないこと
- 開始点からたどるすべての経路が有限回でoutcomeへ到達すること
- 実装されたフロー・質問・結果数が提出時点の定義と一致すること

validatorはグラフ構造だけを検証し、質問内容、選択肢、結果、トリアージの医学的妥当性は判定しません。
