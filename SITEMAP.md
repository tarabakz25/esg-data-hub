ルーティング方針のアップデート

**「/ はマーケ系ランディング、業務画面は /dashboard から始まる」**──という前提に合わせて、ページ構成・遷移フロー・ディレクトリ例をすべて更新しました。

⸻

1. 改訂版 URL 一覧

パス	ページ種別	主なコンテンツ / 機能
/	ランディングページ (Public)	• キャッチコピー＋ヒーローイメージ• 機能一覧・メリット• 価格 / FAQ• CTA: 無料トライアル / ログイン
/signin /signup	認証 (Public)	NextAuth の Credential/OAuth 画面
/dashboard	業務ダッシュボード (Private)	KPI カード、アラート、進捗チャート
/sources	データソース管理	CSV/API 連携先の登録・編集
/ingest	アップロード & 取込ログ	D&D UI、スケジュール状況
/mapping	意味マッピング	LLM 推論結果レビュー
/kpi-check	欠損 KPI チェック	ISSB 必須リスト照合
/records	データブラウザ	行レベル閲覧・エクスポート
/audit	証跡 & バージョンチェーン	差分比較、コメント
/reports ★拡張	レポート出力	PDF/XBRL 生成
/benchmarks ★拡張	ベンチマーク分析	同業比較グラフ
/admin	管理設定	ユーザー / ロール / API Key

★＝MVP 後に追加予定

⸻

2. ページ遷移フロー（改訂版）

2-1. はじめて利用する IR 部門

flowchart TD
    L[/─(Public) ランディング/] --> CTA[「トライアル開始」]
    CTA --> S[/signup]
    S --> A[/dashboard]
    A -->|DataSource 無| B[/sources]
    B --> C[/ingest]
    C --> D[/mapping]
    D --> E[/kpi-check]
    E --> A

	•	ランディング → 新規登録 → /dashboard へ。
	•	useOnboardingGuard() で 未登録の DataSource があれば /sources へ自動リダイレクト。

2-2. 日常運用（IR & データ提出者）

flowchart TD
    D[/dashboard] -- 欠損クリック --> K[/kpi-check]
    K -- 通知 --> Slack
    Slack -- deep-link --> I[/ingest?upload=true]
    I --> M[/mapping?pending]
    M --> D

	•	/dashboard は業務ハブ。以降の動きは変更なし。

2-3. 監査タイミング

flowchart TD
    AU[監査ユーザー /signin] --> /audit
    /audit -->|差分あり| /audit/diff/:id --> コメント --> /audit
    /audit -->|OK| /reports

	•	監査ロールはログイン後 デフォルトで /audit に飛ばす。

⸻

3. Next.js App Router 例（公開 / 認証エリア分離）

app/
├─ (public)/
│   ├─ layout.tsx     # ランディング用レイアウト
│   ├─ page.tsx       # /
│   ├─ pricing/page.tsx
│   └─ signin/page.tsx
├─ (protected)/
│   ├─ layout.tsx     # 認証後レイアウト（SideNav）
│   ├─ dashboard/page.tsx
│   ├─ sources/page.tsx
│   ├─ ingest/
│   │   ├─ page.tsx
│   │   └─ history/page.tsx
│   ├─ mapping/page.tsx
│   ├─ kpi-check/page.tsx
│   ├─ records/page.tsx
│   ├─ audit/
│   │   ├─ page.tsx
│   │   └─ diff/[id]/page.tsx
│   └─ admin/users/page.tsx
└─ middleware.ts        # (public) 以外は auth ガード

	•	Route Group (public) は静的生成＋軽量。
	•	middleware.ts で !session && pathname.startsWith('/(protected)') は /signin へ。
	•	Slack deep-link は https://app.example.com/ingest?upload=true&source=env_dept のように (protected) 配下を直撃。

⸻

4. ランディングページに載せると刺さる 3 点

セクション	キーメッセージ	実装ヒント
ヒーロー	「ESG データ統合を 3 週間で」	Lottie でアニメ背景＋CTA
機能スライス	取込 → 自動マッピング → 監査証跡	3-step イラスト
社会的証明	ISSB ガイドライン準拠、監査法人事例	ロゴ & 実績数カウンター


⸻

まとめ
	•	/ を完全なマーケティングページに分離し、B2B SaaS らしいファネル（Landing → Sign-up → Dashboard）を構築。
	•	業務 UI は /dashboard 以下に集約。オンボーディングと日常フローはガード＆リダイレクトで迷わせない。
	•	Route Group で (public)/(protected) を明確に区切り、SSG＋Auth Guard の両立とビルド速度を最適化。