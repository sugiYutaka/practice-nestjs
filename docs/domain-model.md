# ドメインモデル

## 概要

本プロジェクトは NestJS + React の練習プロジェクト。
クリーンアーキテクチャと DDD パターンの学習を目的としている。
以下の7つの境界づけられたコンテキスト（Bounded Context）で構成予定。

エンティティはRDBのテーブル定義ではなく、**ドメインの概念**として記述する。
プリミティブ型でビジネスルールを持つ値は **Value Object** として切り出す。

---

## 共通 Value Objects

| Value Object | 内部値 | バリデーション |
|-------------|--------|---------------|
| `Price` | number | 0以上 **（実装済み）** |
| `Ingredient` | name: string, quantity: string | 原材料名と分量のペア |
| `Email` | string | メールアドレス形式、ユニーク |
| `AuthType` | enum | `local` \| `google` \| `apple` \| `line` \| `yahoo` \| `facebook` |
| `Password` | string | 8文字以上、ハッシュ化して保持（local時のみ） |
| `ZipCode` | string | 7桁の数字（ハイフンなし） |
| `Prefecture` | string | 有効な都道府県名 |
| `PhoneNumber` | string | 10〜13桁の数字 |
| `ProductCategory` | name: string, isCompact: boolean | 商品カテゴリ（小型商品フラグ付き） |
| `Quantity` | number | 1以上の整数 |
| `OrderId` | string | UUIDの先頭30文字 |
| `OrderStatus` | enum | `unpaid` \| `confirmed` \| `shipped`（一方向遷移のみ） |
| `PaymentType` | enum | `credit-card` \| `paypay` |
| `NotificationType` | enum | `ORDER_CONFIRMED` \| `ORDER_SHIPPED` \| `PAYMENT_COMPLETED` \| `PAYMENT_FAILED` |

---

## 1. Product Domain（商品）

### Entity: Product

```
Product
├── UUID: string                  # 識別子
├── name: string                  # 商品名
├── price: Price                  # 価格（ValueObject）
├── description?: string          # 商品説明
├── stock: boolean                # 在庫あり/なし（実装予定）
├── ingredients: Ingredient[]     # 原材料リスト（ValueObject）（実装予定）
├── mainImage: string             # メイン画像パス（実装予定）
├── subImages: string[]           # サブ画像パスリスト（実装予定）
├── category: ProductCategory      # カテゴリ（ValueObject）（実装予定）
├── sortOrder: number             # 表示順（小さいほど先に表示）（実装予定）
├── createdAt: Date               # 作成日時（実装予定）
└── updatedAt: Date               # 更新日時（実装予定）
```

### Value Object: Price **（実装済み）**

```typescript
Price {
  amount: number  // 0以上
}
```

### Value Object: Ingredient（実装予定）

```
Ingredient {
  name: string       // 原材料名（例: "鶏ムネ肉"）
  quantity: string    // 分量（例: "200g"）
}
```

### Value Object: ProductCategory（実装予定）

```
ProductCategory {
  name: string         // カテゴリ名
  isCompact: boolean   // 小型・軽量商品カテゴリか
}
```

- `isCompact = true` のカテゴリのみの注文は固定配送料の対象となる（Shipping Domain 参照）

### Business Rules
- 金額が0未満の場合エラーをスロー（`Price` Value Object で実装済み）
- 在庫ありの商品を優先表示（stock=true が先）（実装予定）
- 同一在庫状態内では `sortOrder` 昇順で並べる（実装予定）

### Use Cases
- `ProductUsecase.get()` — 全商品取得 **（実装済み・モックデータ）**
- `GetProductById` — 商品詳細取得（実装予定）
- `CreateProduct` — 商品登録・Admin（実装予定）
- `UpdateProduct` — 商品更新・Admin（実装予定）
- `DeleteProduct` — 商品削除・Admin（実装予定）
- `UpdateStock` — 在庫状態更新・Admin（実装予定）

---

## 2. User Domain（ユーザー）（実装予定）

### Entity: User（集約ルート）

```
User
├── id: number                    # 識別子
├── name: string                  # 氏名
├── email: Email                  # メールアドレス（ValueObject）
├── authType: AuthType            # 認証方式（ValueObject）
├── password?: Password           # パスワード（ValueObject、Local時のみ）
├── emailVerifiedAt?: Date        # メール認証日時（Local時のみ）
├── role: UserRole                # ユーザー種別（User | Admin）
├── addresses: Address[]          # 住所一覧（最大5件）
└── createdAt: Date               # 作成日時
```

### Value Object: AuthType

```
AuthType = "local" | "google" | "apple" | "line" | "yahoo" | "facebook"
```

- `local` — 当サイトでメール+パスワードで登録
- それ以外 — Cognito経由のソーシャル認証で登録

### Entity: Address

```
Address
├── id: number                    # 識別子
├── recipientName: string         # 届け先氏名
├── zipCode: ZipCode              # 郵便番号（ValueObject）
├── prefecture: Prefecture        # 都道府県（ValueObject）
├── streetAddress: string         # 市区町村・番地
├── building?: string             # 建物名等（任意）
├── country: string               # 国（デフォルト: JAPAN）
├── phoneNumber: PhoneNumber      # 電話番号（ValueObject）
└── active: boolean               # 有効フラグ（論理削除用）
```

### Business Rules
- 1ユーザーあたり住所は最大5件まで（`User.addresses.length <= 5`）
- 住所削除は論理削除（`address.active = false`）
- `authType = local` の場合: password 必須、メール認証が必要
- `authType != local` の場合: password 不要、Cognito認証済みのため emailVerifiedAt は即時設定
- 同一メールアドレスで local と google の両方は不可（email でユニーク）

### Use Cases
- `RegisterUser` — ユーザー登録（local）
- `RegisterWithSocial` — ソーシャル認証でユーザー登録（Cognito連携）
- `LoginUser` — ログイン（local）
- `LoginWithSocial` — ソーシャル認証でログイン（Cognito連携）
- `VerifyEmail` — メール認証（local のみ）
- `ResetPassword` — パスワードリセット（local のみ）
- `UpdateProfile` — プロフィール更新
- `AddAddress` — 住所追加
- `DeleteAddress` — 住所削除（論理削除）
- `GetAddresses` — 住所一覧取得

---

## 3. Cart Domain（カート）

### 現在の実装（DTO ベース）

```
PostCartDto（入力）
├── UUID: string                  # 商品UUID
└── quantity: number              # 数量

PostedCartDto（出力）
├── product: GetProductDto        # 商品情報
└── quantity: number              # 数量
```

### 目標モデル（実装予定）

#### Entity: Cart（集約ルート）

```
Cart
├── user: User                    # カート所有者
└── items: CartItem[]             # カートアイテム一覧
```

#### Entity: CartItem

```
CartItem
├── id: number                    # 識別子
├── product: Product              # 商品への参照
├── quantity: Quantity             # 数量（ValueObject）
└── request?: string              # 要望・特記事項（ユーザー入力）
```

### Business Rules（実装予定）
- 同一商品かつ同一 request の場合は数量を加算
- 同一商品でも request が異なる場合は別の CartItem として扱う
- 数量が0になったらカートから削除

### Use Cases
- `CartService.post()` — カートに追加 **（実装済み・モックデータ・DDDパターン未適用）**
- `UpdateCartItem` — カートアイテム更新（実装予定）
- `RemoveFromCart` — カートから削除（実装予定）
- `GetCart` — カート取得（実装予定）
- `ClearCart` — カートクリア（実装予定）

---

## 4. Order Domain（注文）（実装予定）

### Entity: Order（集約ルート）

```
Order
├── id: number                    # 識別子
├── orderId: OrderId              # 注文ID（ValueObject、UUID短縮版）
├── user: User                    # 注文者
├── shippingAddress: Address      # 送付先住所
├── items: OrderItem[]            # 注文明細
├── status: OrderStatus           # 注文ステータス（ValueObject）
├── designation?: DeliveryDesignation  # 配達希望（ValueObject）
└── createdAt: Date               # 注文日時
```

### Entity: OrderItem

```
OrderItem
├── product: Product              # 商品への参照
├── quantity: Quantity             # 数量（ValueObject）
└── request?: string              # 要望・特記事項（CartItemから引き継ぎ）
```

### Value Object: OrderStatus

```
OrderStatus = "unpaid" | "confirmed" | "shipped"
```

- `unpaid` — 仮注文（決済待ち）
- `confirmed` — 確定注文（決済完了）
- `shipped` — 発送済み

### Value Object: DeliveryDesignation

```
DeliveryDesignation {
  date?: Date       // 送達希望日（未来日）
  timeSlot?: string // 送達希望時間帯
}
```

### ステータス遷移

```
unpaid（仮注文）
  ↓ 決済完了（Payment Domain から通知）
confirmed（確定注文）
  ↓ 発送処理（Admin操作）
shipped（発送済み）
```

- 遷移は一方向のみ（逆方向への遷移は不可）
- 各遷移時に Notification Domain へイベントを発行

### Business Rules
- 注文IDはUUIDの先頭30文字（`OrderId` Value Object で生成）
- ステータス遷移は `unpaid → confirmed → shipped` の順のみ許可
- `confirmed` への遷移は Payment Domain の決済成功を条件とする
- `shipped` への遷移時にメール送信（Notification Domain 連携）
- `paymentType` は Payment Domain が管理（Order は関知しない）

### Use Cases
- `CreateOrder` — 注文作成（status: unpaid）
- `ConfirmOrder` — 注文確定（unpaid → confirmed、決済成功時）
- `ShipOrder` — 発送処理（confirmed → shipped、Admin）
- `GetOrders` — 注文一覧取得（Admin）
- `DeleteOrder` — 注文削除（Admin）

---

## 5. Payment Domain（決済）（実装予定）

### Value Object: PaymentRequest

```
PaymentRequest {
  order: Order            // 対象注文
  amount: Price           // 決済金額（ValueObject再利用）
  payType: PaymentType    // 決済種別（ValueObject）
}
```

### External Integration
- 決済リンク生成
- Webhook受信（決済完了通知）

### Business Rules
- 決済金額 = 商品合計 + 送料 - 割引
- 決済成功時にカートクリア＋注文確定
- Webhook署名検証必須

### Use Cases
- `CreatePaymentLink` — 決済リンク生成
- `ProcessWebhook` — Webhook処理
- `CalculateTotal` — 合計金額計算

---

## 6. Shipping Domain（配送）（実装予定）

### Value Object: ShippingFee

```
ShippingFee {
  baseFee: Price          // 基本送料
  coolFee: Price          // クール便追加料金
  total: Price            // 合計送料
}
```

### 配送料の決定ロジック

```
注文内の全商品が compact カテゴリ かつ 合計個数 ≤ N個
  → 全国一律の固定配送料（レターパック等）

それ以外（通常商品を含む or compact商品が N個超）
  → お届け先の都道府県で配送料を決定
```

### 固定配送料（compact商品のみ）

| 条件 | 配送料 |
|------|--------|
| compact カテゴリのみ かつ N個以下 | 全国一律 ¥XXX（要確定） |

### 都道府県別配送料（通常配送）

| 地域 | 都道府県 | 基本送料 | クール便 | 合計 |
|------|---------|---------|---------|------|
| 北海道 | 北海道 | ¥1,970 | ¥275 | ¥2,245 |
| 東北 | 青森, 岩手, 秋田, 宮城, 山形, 福島 | ¥1,360 | ¥275 | ¥1,635 |
| 沖縄 | 沖縄 | ¥1,360 | ¥275 | ¥1,635 |
| 関東 | 東京, 神奈川, 千葉, 埼玉, 群馬, 栃木, 茨城, 山梨 | ¥1,090 | ¥275 | ¥1,365 |
| 甲信越 | 新潟, 長野 | ¥1,090 | ¥275 | ¥1,365 |
| 中部 | 愛知, 静岡, 岐阜, 三重 | ¥960 | ¥275 | ¥1,235 |
| 北陸 | 富山, 石川, 福井 | ¥960 | ¥275 | ¥1,235 |
| 関西 | 大阪, 京都, 兵庫, 奈良, 滋賀, 和歌山 | ¥840 | ¥275 | ¥1,115 |
| 中国 | 広島, 岡山, 山口, 鳥取, 島根 | ¥840 | ¥275 | ¥1,115 |
| 四国 | 香川, 愛媛, 徳島, 高知 | ¥840 | ¥275 | ¥1,115 |
| 九州 | 福岡, 佐賀, 長崎, 熊本, 大分, 宮崎, 鹿児島 | ¥840 | ¥275 | ¥1,115 |

### Business Rules
- 全商品が `ProductCategory.isCompact = true` かつ合計個数 ≤ N → 固定配送料
- 上記以外 → お届け先の `Prefecture` から都道府県別配送料を適用

### Use Cases
- `CalculateShippingFee` — 送料計算（注文内容 + お届け先から判定）

---

## 7. Notification Domain（通知）（実装予定）

### Entity: Notification

```
Notification
├── id: number                        # 識別子
├── recipient: User                   # 通知先ユーザー
├── type: NotificationType            # 通知タイプ（ValueObject）
├── title: string                     # タイトル
├── message: string                   # メッセージ本文
├── isRead: boolean                   # 既読フラグ
└── createdAt: Date                   # 作成日時
```

### Email Templates

| Template | Trigger | Description |
|----------|---------|-------------|
| OrderConfirmed | 決済完了時 | 注文確認メール |
| OrderShipped | 発送時 | 発送通知メール |

### Use Cases
- `SendNotification` — 通知送信
- `GetNotifications` — 通知一覧取得
- `MarkAsRead` — 既読処理

---

## ドメイン間の関係

```
User ──┬── Cart ──── Product
       │               │
       ├── Order ──────┤
       │     │
       │  Payment
       │     │
       └── Shipping
             │
         Notification
```

### 主要な関連

| 関連 | 説明 |
|------|------|
| User → Cart | ユーザーは1つの Cart（集約）を持つ |
| User → Order | ユーザーは複数の Order を持つ |
| User → Address | ユーザーは最大5つの Address を持つ（User集約内） |
| Cart → Product | CartItem が Product を参照 |
| Order → Product | OrderItem が Product を参照 |
| Order → Address | Order が配送先 Address を保持 |
| Order → Payment | Order に対して1つの決済 |
| Shipping → Address | Address の Prefecture から送料を計算 |
| Notification → User | 各イベントで recipient に通知 |

---

## 実装状態

| ドメイン | Entity | ValueObject | Repository | UseCase | Controller | DB |
|---------|--------|-------------|------------|---------|------------|-----|
| Product | **実装済み** | **Price 実装済み** | **実装済み（モック）** | **実装済み（get）** | **実装済み** | 未接続 |
| Cart | 未実装 | — | 未実装 | 未実装（Serviceで代用） | **実装済み** | 未接続 |
| User | 未実装 | — | 未実装 | 未実装 | 未実装 | 未接続 |
| Order | 未実装 | — | 未実装 | 未実装 | 未実装 | 未接続 |
| Payment | 未実装 | — | 未実装 | 未実装 | 未実装 | 未接続 |
| Shipping | 未実装 | — | 未実装 | 未実装 | 未実装 | 未接続 |
| Notification | 未実装 | — | 未実装 | 未実装 | 未実装 | 未接続 |
