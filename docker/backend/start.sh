#!/bin/bash

# PHP-FPM をバックグラウンドで起動する
php-fpm -D

# Nginx をフォアグラウンドで起動する
nginx -g "daemon off;"
