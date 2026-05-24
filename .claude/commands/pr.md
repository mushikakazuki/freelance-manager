---
description: 現在のブランチからGitHub PRを作成する
allowed-tools: Bash, Read
---

以下の手順でPRを作成してください。

1. `git log main..HEAD --oneline` でmainとの差分コミットを確認する
2. `git diff main..HEAD` で変更内容を確認する
3. 以下の形式でPRの内容を生成する：

## PR出力形式

**タイトル：** Conventional Commit形式（日本語）
例: feat(auth): ログイン機能を追加

**概要：**
- このPRで何をしたか（2〜3行）

**変更内容：**
- 変更したファイルと変更理由を箇条書き

**確認事項：**
- レビュアーに特に見てほしいポイント
- 動作確認方法

4. 内容を表示して確認を求める（yes/noで答えられるようにする）
5. yesの場合、`gh pr create` でPRを作成する
   - ghコマンドがない場合はPR内容をそのまま表示して終了する

PRの説明文は日本語で生成してください。
