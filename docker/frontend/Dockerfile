FROM node:20-alpine

WORKDIR /app

# 依存関係ファイルをコピーする（キャッシュ最適化）
COPY frontend/package*.json ./

# 依存関係をインストールする
RUN npm ci

# ソースコードをコピーする
COPY frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
