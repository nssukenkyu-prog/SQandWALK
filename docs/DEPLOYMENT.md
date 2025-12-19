# デプロイメントガイド

動作評価AIシステムのCloudflareへのデプロイ手順です。

## 前提条件

- Cloudflareアカウント
- GitHubアカウント（リポジトリ連携用）
- OpenAI APIキー
- Node.js 18以上

## 1. Cloudflare Pages（フロントエンド）

### 1.1 プロジェクト作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. GitHubリポジトリ `nssukenkyu-prog/SQandWALK` を選択
4. ビルド設定:
   - **Framework preset**: None
   - **Build command**: （空白）
   - **Build output directory**: `frontend`
   - **Root directory**: （空白）

### 1.2 デプロイ確認

デプロイ完了後、`https://sqandwalk.pages.dev`（または設定したドメイン）でアクセスできます。

## 2. Cloudflare Workers（バックエンドAPI）

### 2.1 ローカル準備

```bash
cd workers
npm install
```

### 2.2 環境変数設定

```bash
# OpenAI APIキーを設定（ブラウザが開きログインを求められます）
npx wrangler secret put OPENAI_API_KEY
# プロンプトに従ってAPIキーを入力
```

### 2.3 デプロイ

```bash
npx wrangler deploy
```

デプロイ成功後、Workers URLが表示されます（例: `https://movement-eval-api.YOUR_SUBDOMAIN.workers.dev`）

### 2.4 CORS設定（本番環境）

`workers/src/index.js` の `corsHeaders` を本番用に更新:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sqandwalk.pages.dev', // 実際のPages URL
  // ...
};
```

## 3. フロントエンド設定更新

### 3.1 APIエンドポイント設定

`frontend/js/app.js` の `CONFIG.API_ENDPOINT` を更新:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://movement-eval-api.YOUR_SUBDOMAIN.workers.dev/api/evaluate',
  // ...
};
```

### 3.2 再デプロイ

変更をコミット・プッシュすると、Cloudflare Pagesが自動的に再デプロイします。

## 4. 動作確認

1. フロントエンドにアクセス
2. 動画をアップロード
3. 動作種別を選択
4. 「評価を開始」をクリック
5. 評価結果が表示されることを確認

## トラブルシューティング

### Workers APIがエラーを返す

1. `wrangler tail` でリアルタイムログを確認
2. OpenAI APIキーが正しく設定されているか確認
3. CORSヘッダーが正しいか確認

### 動画がアップロードできない

1. ファイルサイズが50MB以下か確認
2. 対応形式（MP4, MOV, WebM）か確認
3. ブラウザのコンソールでエラーを確認

### 評価結果が「デモモード」になる

OpenAI APIキーが設定されていないか、APIエラーが発生しています。Workers のログを確認してください。
