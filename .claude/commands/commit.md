---
description: git diffを読んでConventional Commit形式でコミットする
allowed-tools: Bash, Read
---

以下の手順でコミットしてください。

1. `git diff --staged` でステージング済みの変更を確認する
2. ステージングがなければ ユーザーに追加を促す
3. 以下のルールでステージングする：
   - ソースコード（php, tsx, ts, vue, js, css, scss）は自動で `git add`
   - 設定ファイル（.env, *.lock, composer.lock, package-lock.json, md）は一つずつ確認（yes/no）してから `git add`
   - .gitignore に含まれるべきファイルは警告を出す
4. 変更内容からConventional Commit形式のメッセージを生成する
5. `git commit -m "メッセージ"` でコミットする

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
