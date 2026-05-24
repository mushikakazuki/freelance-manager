---
description: git diffを読んでConventional Commit形式でコミット/プッシュ
allowed-tools: Bash, Read
---

以下の手順でコミットしてください。

0. コミット前にmain, developブランチにpushする場合は、必ず向け先が問題ないか確認をしてください。
1. `git diff --staged` でステージング済みの変更を確認する
2. ステージングがなければユーザーに「ステージングされたファイルがありません。git addしてから再度実行してください。」と伝えて終了する
3. 以下のルールでステージングする：
   - ソースコード（php, tsx, ts, vue, js, css, scss）は自動で `git add`
   - 設定ファイル（.env, *.lock, composer.lock, package-lock.json, md）は一つずつ確認（yes/no）してから `git add`
   - .gitignore に含まれるべきファイルは警告を出す
4. 変更内容からConventional Commit形式のメッセージを生成する
5. コミット前に以下を表示して確認を求める（yes/noで答えられるようにする）：
   - 変更ファイル一覧
   - 生成したコミットメッセージ
6. yesの場合、`git commit -m "メッセージ"` でコミットする
7. コミット後に現在のブランチ名を確認して `git push origin <ブランチ名>` でプッシュする
8. プッシュ完了後にリモートURLを表示する

## Conventional Commit形式のルール

- feat: 新機能
- fix: バグ修正
- refactor: リファクタリング
- style: フォーマット変更（動作に影響しないもの）
- test: テスト追加・修正
- docs: ドキュメント変更
- chore: ビルド・設定ファイルの変更

## 出力形式

コミット前に以下を表示してください：
- 変更ファイル一覧
- 生成したコミットメッセージ
- 確認を求める（yes/noで答えられるようにする）
- コミットメッセージは日本語で生成してください。
