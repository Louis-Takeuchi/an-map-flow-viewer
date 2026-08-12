# Flow data format

問診データは[`src/data/flow_v1.0.json`](../src/data/flow_v1.0.json)の`nodes`配列にあります。データ形式は質問と遷移を表すもので、医学的妥当性を記述・検証するための形式ではありません。

## Top-level fields

| フィールド | 内容 |
| --- | --- |
| `entry_node_id` | JSONに記録されている救急フローの開始ノードID |
| `nodes` | 3フロー分の質問ノード配列 |

薬・病院案内を含む各フローの開始ノードは[`src/config/flowMetadata.js`](../src/config/flowMetadata.js)に定義しています。

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
| `node_id` | Repository全体で一意な質問ID |
| `response_type` | 質問の表示上の分類 |
| `question_text` | 表示する質問文 |
| `flow_kind` | `emergency`、`medicine`、`hospital`のいずれか |
| `options` | 回答選択肢の配列 |

## Choice and transition

各選択肢は`option_id`と`option_text`を持ち、次の質問または結果のどちらか一方を参照します。

- `next_node_id`が文字列の場合: 同じフロー内の質問ノードへ進みます。
- `outcome_id`がある場合: 質問を終了し、その結果ノードへ進みます。
- `triage_level`がある場合: 結果を識別する表示色の選択に使います。

`npm run validate:flows`は、ID重複、参照先、到達可能性、すべての経路が結果へ到達できるかを構造面だけ検証します。医学的な正しさは検証しません。
