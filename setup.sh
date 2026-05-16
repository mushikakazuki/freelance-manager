#!/bin/bash
set -e

echo "=== Freelance Manager セットアップ開始 ==="

# 1. 環境変数ファイルを作成する
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env ファイルを作成しました"
fi

# 2. Laravel を一時ディレクトリにインストールしてバックエンドにコピーする
echo "Laravel 11 をインストール中..."
docker run --rm \
    -v /tmp/laravel-base:/app \
    composer:latest \
    composer create-project laravel/laravel:^11.0 /app --quiet

# バックエンドにコピーする（既存カスタムファイルを上書きしない）
mkdir -p backend
cp -rn /tmp/laravel-base/. backend/ 2>/dev/null || true
echo "✓ Laravel をインストールしました"

# 3. Docker コンテナを起動する
echo "Docker コンテナを起動中..."
docker compose up -d

# MySQL が起動するまで待機する
echo "MySQL の起動を待機中..."
until docker compose exec -T mysql mysqladmin ping -h localhost -u root \
    -p"${DB_ROOT_PASSWORD:-root_password}" --silent 2>/dev/null; do
    sleep 2
done
echo "✓ MySQL が起動しました"

# 4. バックエンドのキーを生成する
docker compose exec backend php artisan key:generate --quiet
echo "✓ アプリケーションキーを生成しました"

# 5. 追加パッケージをインストールする
echo "バックエンドパッケージをインストール中..."
docker compose exec backend composer require laravel/sanctum nuwave/lighthouse --quiet
docker compose exec backend composer require --dev \
    phpstan/phpstan nunomaduro/larastan friendsofphp/php-cs-fixer --quiet
echo "✓ バックエンドパッケージをインストールしました"

# 6. Sanctum と Lighthouse の設定を公開する
docker compose exec backend php artisan vendor:publish \
    --provider="Laravel\Sanctum\SanctumServiceProvider" --quiet
docker compose exec backend php artisan vendor:publish \
    --tag=lighthouse-schema --quiet
docker compose exec backend php artisan vendor:publish \
    --tag=lighthouse-config --quiet
echo "✓ 設定ファイルを公開しました"

# 7. マイグレーションを実行する
echo "データベースのマイグレーションを実行中..."
docker compose exec backend php artisan migrate --quiet
echo "✓ マイグレーションを実行しました"

# 8. Next.js フロントエンドをインストールする
echo "Next.js 15 をインストール中..."
docker run --rm \
    -v "$(pwd):/work" \
    -w /work \
    node:20-alpine \
    sh -c "npx create-next-app@latest frontend \
        --typescript --tailwind --eslint --app --src-dir \
        --import-alias '@/*' --no-git --quiet"
echo "✓ Next.js をインストールしました"

# 9. フロントエンド追加パッケージをインストールする
echo "フロントエンドパッケージをインストール中..."
docker compose exec frontend sh -c "npm install @apollo/client graphql --quiet && \
    npm install --save-dev \
    prettier eslint-config-prettier \
    jest jest-environment-jsdom \
    @testing-library/react @testing-library/jest-dom \
    @testing-library/user-event @types/jest ts-jest --quiet"
echo "✓ フロントエンドパッケージをインストールしました"

echo ""
echo "=== セットアップ完了 ==="
echo "  フロントエンド: http://localhost:3000"
echo "  バックエンド GraphQL: http://localhost:8000/graphql"
echo ""
echo "次のステップ: make test-backend / make analyze"
