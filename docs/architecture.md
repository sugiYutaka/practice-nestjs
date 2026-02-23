# アーキテクチャ詳細

## 概要

本プロジェクトは **NestJS（バックエンド）** と **React + Vite（フロントエンド）** のモノレポ構成。
バックエンドは **クリーンアーキテクチャ** と **DDD（ドメイン駆動設計）** に基づいて構成されている。
ビジネスロジックはフレームワークに依存しない形で実装する。

## プロジェクト全体構成

```
practice-nestjs/
├── BE/                          # バックエンド（NestJS）
├── FE/                          # フロントエンド（React + Vite）
└── docs/                        # ドキュメント
```

## バックエンドのレイヤー構成

### 現在の構成

```
BE/src/
├── domain/                      # ドメイン層（最内層）
│   ├── entities/               # ドメインエンティティ
│   │   └── product.ts
│   ├── value-object/           # 値オブジェクト
│   │   └── price.ts
│   ├── repositories/           # リポジトリ抽象クラス
│   │   └── product.repository.ts
│   └── mappers/                # Entity ↔ DTO 変換
│       └── product.mapper.ts
├── usecases/                    # アプリケーション層
│   └── product.usecase.ts
├── dto/                         # 共有DTO
│   ├── product.dto.ts
│   └── cart.dto.ts
└── infrastracture/              # インフラ層（最外層）
    ├── prisma/                 # リポジトリ実装
    │   └── prisma.product.ts  # （現在はモックデータ）
    └── modules/                # NestJS Controller / Module
        ├── product/
        │   ├── product.module.ts
        │   └── product.controller.ts
        └── cart/
            ├── cart.module.ts
            ├── cart.controller.ts
            └── cart.service.ts
```

### 目標構成（全ドメイン実装後）

```
BE/src/
├── domain/
│   ├── entities/               # 各ドメインのエンティティ
│   ├── value-object/           # 値オブジェクト（Price等）
│   ├── repositories/           # リポジトリ抽象クラス
│   └── mappers/                # Entity ↔ DTO 変換
├── usecases/                    # ユースケース
├── dto/                         # 共有DTO
└── infrastracture/
    ├── prisma/                 # Prisma実装 / スキーマ
    └── modules/                # NestJS Controller / Module
        └── {domain}/
```

## 依存の方向と依存性逆転

**外側 → 内側**への一方向のみ。内側のレイヤーは外側を知らない。

```
infrastracture (Controller, Prisma実装)
  ↓ 依存
usecases (ビジネスロジック)
  ↓ 依存
domain (Entity, ValueObject, Repository抽象, Mapper)
```

### 依存性逆転の原則 (DIP)

- `domain/repositories/` にリポジトリの**抽象クラス**を定義
- `infrastracture/prisma/` に**具象実装**を配置
- NestJS の DI コンテナ（`useFactory`）で抽象と実装を紐付け

```typescript
// domain/repositories/product.repository.ts（抽象）
export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract create(data: Product): Promise<Product>;
}

// infrastracture/prisma/prisma.product.ts（実装）
export class PrismaProduct implements ProductRepository { ... }

// infrastracture/modules/product/product.module.ts（DI設定）
{
  provide: ProductRepository,
  useFactory: () => new PrismaProduct(),
}
```

## 各層の責務

| 層 | 責務 | 含まれるもの |
|----|------|-------------|
| **Controller** | HTTPリクエスト/レスポンス処理のみ | `@Controller`, `@Get`, `@Post` |
| **UseCase** | アプリケーションロジックの調整 | Repository呼び出し、Mapper変換 |
| **Domain Entity** | ドメインの状態表現 | `Product`（UUID, name, price, description） |
| **Value Object** | 値の表現とバリデーション | `Price`（金額は0以上） |
| **Domain Mapper** | DTO ↔ Entity の相互変換 | `ProductMapper.toResponse()`, `toEntity()` |
| **Repository（抽象）** | データアクセスの契約 | `findAll`, `create` |
| **Repository（実装）** | 具体的なDB操作 | Prisma Client 経由の操作（現在はモック） |

## データフロー

```
HTTP Request
  ↓
Controller（@Body で DTO を受け取り）
  ↓
UseCase.execute(dto)
  ↓
Mapper（DTO → Entity）
  ↓
Repository（Entity → DB）
  ↓
Mapper（Entity → ResponseDTO）
  ↓
HTTP Response
```

外部サービス連携を含む場合（実装予定）:

```
Controller → UseCase → Domain Service → Repository → Database
                     ↘
               External Services (Payment, Mail)
```

## フロントエンド構成

```
FE/src/
├── main.tsx             # エントリーポイント
├── App.tsx              # ルートコンポーネント
├── components/
│   └── Home.tsx         # メインUIコンポーネント
└── assets/
```

- **React 19** + **Vite 7** + **TypeScript**
- **React Router DOM** でルーティング
- `fetch` API でバックエンドと通信

## 技術スタック

### バックエンド
- NestJS 10.0.0
- TypeScript 5.1.3
- Jest（テスト）
- ESLint + Prettier（コード品質）

### フロントエンド
- React 19.2.0
- Vite 7.3.1
- TypeScript 5.9.3
- React Router DOM 6.30.3

## パスエイリアス

| エイリアス | 実パス | 備考 |
|-----------|--------|------|
| `@/core/*` | `BE/src/core/*` | tsconfig.json に定義（今後活用予定） |

## サーバー設定

- **ポート**: 3000（`PORT` 環境変数で変更可能）
- **CORS**: `origin: '*'` で全許可（開発用）

## Environment Variables（実装予定含む）

```env
# Database
DATABASE_URL=

# Auth（実装予定）
JWT_SECRET=
JWT_EXPIRES_IN=

# Mail（実装予定）
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=

# Payment（実装予定）
PAYMENT_API_SECRET=
PAYMENT_SIGNATURE=

# App
APP_ENV=production|development
APP_URL=
PORT=3000
```

## Security Considerations（実装予定含む）

1. **認証**: JWT ベースの認証（実装予定）
2. **認可**: Role-based access control - User/Admin（実装予定）
3. **入力検証**: すべての入力値をバリデーション - class-validator 推奨（実装予定）
4. **Webhook検証**: 決済サービスの署名検証必須（実装予定）
5. **CORS**: フロントエンドドメインのみ許可（本番環境で対応予定）
6. **Rate Limiting**: API呼び出し制限（実装予定）
7. **SQLインジェクション対策**: Prisma のパラメータ化クエリ（DB接続時に対応）
8. **XSS対策**: フロントエンドで DOMPurify 使用（実装予定）

## 現在の実装状態

| 項目 | 状態 |
|------|------|
| Product ドメイン（DDD パターン） | Entity, ValueObject, Repository, Mapper, UseCase, Controller 実装済み（モックデータ） |
| Cart ドメイン（簡易実装） | Controller, Service 実装済み（モックデータ、DDDパターン未適用） |
| DB接続（Prisma） | 未実装 |
| 認証・認可（JWT） | 未実装 |
| User / Order / Payment / Shipping / Notification ドメイン | 未実装 |
| テスト | app.controller.spec.ts と E2E テンプレートのみ |
