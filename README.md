# Punch 👊

Punch は Slack での勤怠連絡を行うためのアプリケーションです。

## できること

- Slack OAuth を利用したログイン
- 出勤・退勤の連絡
- ステータス絵文字の変更

## 必要なもの

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Slack App](https://api.slack.com/apps)

## 導入

```shell
git clone https://github.com/nemuki/punch.git
cd punch

pnpm install
```

## 使い方

### `.env` ファイルの作成

`.env.example` をコピーして `.env` ファイルを作成し、環境変数を設定してください。

```shell
cp .env.example .env
```

### Slack App の設定

slack-manifest.yml を元に Slack App を作成してください。

### アプリケーションの起動

```shell
pnpm dev
```

### ビルド

```shell
pnpm build
```

サブディレクトリにデプロイする場合、`vite.config.ts` に `base` を設定してください。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/punch/',
})
```
