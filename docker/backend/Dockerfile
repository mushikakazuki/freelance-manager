FROM php:8.2-fpm

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP 拡張のインストール
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Composer のインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Nginx 設定ファイルのコピー
COPY docker/backend/nginx/default.conf /etc/nginx/sites-available/default

# 起動スクリプトのコピー
COPY docker/backend/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
