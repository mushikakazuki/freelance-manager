.PHONY: up down build restart logs shell-backend shell-frontend migrate seed \
        test-backend test-frontend lint-backend lint-frontend analyze format

## Docker コンテナを起動する
up:
	docker compose up -d

## Docker コンテナを停止する
down:
	docker compose down

## Docker イメージをビルドする
build:
	docker compose build --no-cache

## コンテナを再起動する
restart:
	docker compose restart

## ログを表示する
logs:
	docker compose logs -f

## バックエンドコンテナのシェルに接続する
shell-backend:
	docker compose exec backend bash

## フロントエンドコンテナのシェルに接続する
shell-frontend:
	docker compose exec frontend sh

## データベースのマイグレーションを実行する
migrate:
	docker compose exec backend php artisan migrate

## シーダーを実行する
seed:
	docker compose exec backend php artisan db:seed

## バックエンドのテストを実行する（カバレッジ付き）
test-backend:
	docker compose exec backend php artisan test --coverage

## フロントエンドのテストを実行する（カバレッジ付き）
test-frontend:
	docker compose exec frontend npm run test:coverage

## バックエンドのリンターを実行する（ドライラン）
lint-backend:
	docker compose exec backend vendor/bin/php-cs-fixer fix --dry-run --diff

## フロントエンドのリンターを実行する
lint-frontend:
	docker compose exec frontend npm run lint

## PHPStan による静的解析を実行する
analyze:
	docker compose exec backend vendor/bin/phpstan analyse

## コードのフォーマットを実行する
format:
	docker compose exec frontend npm run format
	docker compose exec backend vendor/bin/php-cs-fixer fix

## 初期セットアップを実行する
setup:
	cp -n .env.example .env || true
	docker compose up -d
	docker compose exec backend php artisan key:generate
	docker compose exec backend php artisan migrate
