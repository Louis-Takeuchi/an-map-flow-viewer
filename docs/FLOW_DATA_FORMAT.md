# Flow data format

現在のデータは[`src/data/flows/`](../src/data/flows/)に保存した公開サイトのJSON原本です。`emergency.json`、`medicine.json`、`hospital.json`をそのまま保持します。旧`flow_v1.0.json`は履歴参照用で、現在のViewerでは使用しません。

## 公開JSON

| フィールド | 内容 |
| --- | --- |
| `id` | `emergency`、`medicine`、`hospital` |
| `protocol_version` | 配信元の版名。版が同じでも内容が変わる可能性があるため全内容を照合 |
| `start` | 開始質問ID |
| `questions` | 質問IDをキーとした辞書 |
| `outcomes` | 結果IDをキーとした辞書 |

質問は`text`、任意の`subtitle`・`evidence`、`choices`を持ちます。各選択肢は`label`、遷移先IDの`next`、任意の`data`を持ちます。結果は`label`と、`triage`または`action`のいずれか、および任意の`hint`・`reason`を持ちます。

`evidence.checked_at`は公開JSONに記載された出典確認日です。Viewerが公開データを確認した日時は[`src/data/source.json`](../src/data/source.json)の`verified_at`です。同ファイルに配信元URL・版・SHA-256・質問数・結果数を記録します。

## Viewerへの変換

[`src/lib/flowModel.js`](../src/lib/flowModel.js)が公開JSONを検証して従来のグラフ形式に変換します。

| 公開JSON | Viewer内部 |
| --- | --- |
| 質問ID / `text` | `node_id` / `question_text` |
| ファイルの`id` | `flow_kind` |
| `subtitle` / `evidence` | 同名で保持 |
| 選択肢の位置 | `option_id: choice_1, choice_2, …`（内部ID） |
| `label` / `data` | `option_text` / `data` |
| 質問を指す`next` | `next_node_id` |
| 結果を指す`next` | `outcome_id`と結果由来の`triage_level`・`action` |
| 結果の`label` / `hint` / `action` / `reason` | そのまま保持・表示 |

`response_type: single_choice`はViewerのUI形式を示します。公開版にない医学的分類や結果の意味を補いません。トリアージのないaction結果は中立色で表示します。結果は`outcome_id`単位で描画し、同じ色の結果をまとめません。

## 検証

`npm run validate:flows`は必須フィールド、ID重複、開始点、参照先、到達不能、循環、空の選択肢、既知のtriage/action、原本と出典メタデータのハッシュ・件数を検証します。未知の構造やactionは同期時にエラーにして、対応を要することを明示します。

`npm test`は全質問・選択肢・結果の変換、全経路の終点一致、不正な参照・循環等の検出を確認します。いずれも医学的妥当性の検証ではありません。
