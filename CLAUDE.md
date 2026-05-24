# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 環境
- Frontend  : Next.js 15 / TypeScript
- Backend   : Laravel 11 / PHP 8.2
- DB        : MySQL 8.0
- Node.js   : 20
- 環境構築   : Docker

## 認証・API
- 認証      : Laravel Sanctum
- API       : GraphQL（Lighthouse PHP）
- CSS       : Tailwind CSS 4

## コード品質
- テスト     : PHPUnit / Jest
- カバレッジ  : 80%以上
- Linter    : ESLint / PHP CS Fixer
- 静的解析   : PHPStan（レベル6）
- フォーマット: Prettier

## コーディング規約
- コメント   : 日本語
- 変数名     : lowerCamelCase

## 不明な箇所について
- 不明点についてはかならず、ユーザーに質問をしてください。

---

## コマンド

すべての操作は Docker コンテナ経由で行う。`make` コマンドを使うか、`docker compose exec` で直接実行する。

### 環境起動・停止
```bash
make up        # コンテナ起動
make down      # コンテナ停止
make build     # イメージをキャッシュなしで再ビルド
make setup     # 初回セットアップ（.env コピー・マイグレーション含む）
```

### テスト
```bash
make test-backend   # PHPUnit（カバレッジ付き）
make test-frontend  # Jest（カバレッジ付き）

# 単一テストの実行
docker compose exec backend php artisan test --filter=テストクラス名
docker compose exec backend php artisan test tests/Feature/ExampleTest.php
```

### Lint・静的解析・フォーマット
```bash
make lint-backend    # PHP CS Fixer（ドライラン）
make lint-frontend   # ESLint
make analyze         # PHPStan
make format          # Prettier + PHP CS Fixer（実際に修正）
```

### DB 操作
```bash
make migrate   # マイグレーション実行
make seed      # シーダー実行
```

### シェルアクセス
```bash
make shell-backend   # バックエンドコンテナ（bash）
make shell-frontend  # フロントエンドコンテナ（sh）
```

---

## アーキテクチャ

### Docker サービス構成

| サービス | ポート | 役割 |
|---|---|---|
| `mysql` | 3307:3306 | MySQL 8.0 データベース |
| `backend` | 8000:8000 | Laravel + PHP-FPM + Nginx |
| `frontend` | 3000:3000 | Next.js 開発サーバー |

### バックエンド（`backend/`）

**GraphQL レイヤー（Lighthouse PHP）**

- スキーマ定義: `backend/graphql/schema.graphql`
- カスタム Mutation リゾルバ: `backend/app/GraphQL/Mutations/`
- CRUD 操作（`@create`, `@update`, `@delete`）は Lighthouse の自動リゾルバで処理
- 認証: `@auth` ディレクティブで保護

**データモデル（`backend/app/Models/`）**

```
User → Client → Project → Invoice
```
- `User` は複数の `Client` を持つ（hasMany）
- `Client` は複数の `Project` を持つ（hasMany）
- `Project` は複数の `Invoice` を持つ（hasMany）

**テスト**

- テスト環境は SQLite インメモリ DB を使用（`phpunit.xml` で設定）
- Feature テスト: `backend/tests/Feature/`
- Unit テスト: `backend/tests/Unit/`

### フロントエンド（`frontend/`）

- Next.js App Router 構成（`frontend/src/app/`）
- GraphQL クライアント: Apollo Client 4（`@apollo/client`）
- `NEXT_PUBLIC_GRAPHQL_URL` 環境変数でバックエンドの GraphQL エンドポイントを指定

### 環境変数

`.env.example` を参照。初回は `cp .env.example .env` でコピー後に `make setup` を実行する。
