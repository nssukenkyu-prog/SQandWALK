# 動作評価AIシステム | Movement Evaluation System

大学教育・研究向けの動作評価Webシステムです。動画から動作パターンを分析し、教育的なフィードバックを提供します。

> ⚠️ **重要**: このシステムは**教育目的**で開発されています。医学的診断や治療の代替となるものではありません。

## 📋 概要

学生がブラウザから動作動画をアップロードすると、AIが以下の動作を分析・評価します：

- **スクワット（前方）**: 正面から撮影した動画
- **スクワット（側方）**: 横から撮影した動画
- **歩行動作**: 歩行を側方から撮影した動画

各動作は4つの観点で5段階評価され、総合スコア（20点満点）とフィードバックが提供されます。

## 🛠️ 技術スタック

| コンポーネント | 技術 |
|--------------|------|
| フロントエンド | HTML / CSS / JavaScript |
| ホスティング | Cloudflare Pages |
| バックエンドAPI | Cloudflare Workers |
| AI評価エンジン | OpenAI GPT-4o（Vision対応） |

## 📁 リポジトリ構成

```
SQandWALK/
├── frontend/           # Cloudflare Pages用
│   ├── index.html
│   ├── css/
│   └── js/
├── workers/            # Cloudflare Workers API
│   ├── src/
│   └── wrangler.toml
├── prompts/            # 評価プロンプト（コードから分離）
│   ├── base_prompt.md
│   ├── squat_front.md
│   ├── squat_side.md
│   └── gait.md
└── docs/               # ドキュメント
    ├── DEPLOYMENT.md
    └── ETHICS.md
```

## 🚀 セットアップ

### 1. フロントエンド（Cloudflare Pages）

1. Cloudflare Dashboardで新しいPagesプロジェクトを作成
2. GitHubリポジトリを連携
3. ビルド設定:
   - **プロダクションブランチ**: `main`
   - **ビルドコマンド**: なし（静的ファイル）
   - **ビルド出力ディレクトリ**: `frontend`

### 2. バックエンドAPI（Cloudflare Workers）

```bash
cd workers
npm install
wrangler secret put OPENAI_API_KEY  # APIキーを設定
wrangler deploy
```

### 3. フロントエンドのAPI接続設定

`frontend/js/app.js` の `CONFIG.API_ENDPOINT` をデプロイしたWorkers URLに更新してください。

## 📊 評価観点

### スクワット（前方）
1. 膝の安定性
2. 足幅・足位置
3. 体幹の安定性
4. 動作の対称性

### スクワット（側方）
1. 膝の位置
2. 股関節の屈曲
3. 脊柱のアライメント
4. 動作の滑らかさ

### 歩行動作
1. 腕振り
2. 歩幅
3. 接地パターン
4. 姿勢

## ⚖️ 倫理・安全設計

- **禁止表現**: 「診断」「異常」「疾患」などの医学用語は使用しません
- **参考情報**: AIの評価は参考情報であり、最終判断は教員・指導者・本人が行います
- **自己比較**: 点数は優劣判定ではなく、振り返りのための指標です

詳細は [docs/ETHICS.md](docs/ETHICS.md) を参照してください。

## 🔮 今後の拡張予定

- [ ] Before/After 比較機能
- [ ] 履歴管理・成長可視化
- [ ] 評価観点のカスタマイズ
- [ ] 研究用データエクスポート

## 📄 ライセンス

教育・研究目的での利用を想定しています。

---

**開発思想**: このシステムは、AIが人を評価するものではありません。AIを使って、人が「動きを考え、言語化し、改善する」ための教育システムです。