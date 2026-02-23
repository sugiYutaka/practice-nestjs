# API 仕様

## 概要

- **ベースURL**: `http://localhost:3000` (開発環境)
- **形式**: RESTful JSON API
- **認証**: JWT Bearer Token（実装予定）
- **CORS**: `origin: '*'`（開発用）

---

## 実装済みエンドポイント

| Method | Endpoint | Description | ハンドラ |
|--------|----------|-------------|---------|
| GET | `/` | Hello World | `AppController.getHello()` |
| GET | `/products` | 商品一覧取得 | `ProductController.getProduct()` |
| POST | `/cart` | カートに追加 | `CartController.postCart()` |

---

## 実装済み API 詳細

### GET /

ルートエンドポイント。

**Response** (`200 OK`):
```
Hello World!
```

### GET /products

全商品を取得する（現在はモックデータ）。

**Response** (`200 OK`):
```json
[
  {
    "UUID": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Sample Product",
    "description": "This is a sample product.",
    "price": 1000
  }
]
```

**レスポンス型**: `GetProductDto[]`

| Field | Type | Description |
|-------|------|-------------|
| UUID | string | 商品UUID |
| name | string | 商品名 |
| price | number | 価格 |
| description | string? | 商品説明 |

**処理フロー**: Controller → ProductUsecase → ProductRepository → ProductMapper → Response

### POST /cart

カートに商品を追加する（現在はモックデータ）。

**Request Body**: `PostCartDto[]`
```json
[
  {
    "UUID": "123e4567-e89b-12d3-a456-426614174000",
    "quantity": 1
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| UUID | string | 商品UUID |
| quantity | number | 数量 |

**Response** (`201 Created`):
```json
[
  {
    "product": {
      "UUID": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Japanese Sword",
      "price": 120,
      "description": "This isa a traditional Japanese sword."
    },
    "quantity": 1
  }
]
```

**レスポンス型**: `PostedCartDto[]`

| Field | Type | Description |
|-------|------|-------------|
| product | GetProductDto | 商品情報 |
| quantity | number | 数量 |

**処理フロー**: Controller → CartService → Response

---

## 実装予定エンドポイント

### Public APIs（認証不要）

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| GET | `/products` | 商品一覧（在庫優先ソート） | GetAllProducts |
| GET | `/products/:id` | 商品詳細 | GetProductById |

### Auth APIs（認証）

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| POST | `/auth/register` | ユーザー登録 | RegisterUser |
| POST | `/auth/login` | ログイン（JWT発行） | LoginUser |
| POST | `/auth/logout` | ログアウト | — |
| POST | `/auth/verify-email` | メール認証 | VerifyEmail |
| POST | `/auth/forgot-password` | パスワードリセット要求 | — |
| POST | `/auth/reset-password` | パスワードリセット | ResetPassword |

### User APIs（認証必須）

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| GET | `/user/profile` | プロフィール取得 | — |
| PUT | `/user/profile` | プロフィール更新 | UpdateProfile |
| GET | `/user/addresses` | 住所一覧 | GetAddresses |
| POST | `/user/addresses` | 住所追加 | AddAddress |
| DELETE | `/user/addresses/:id` | 住所削除（論理削除） | DeleteAddress |

### Cart APIs（認証必須）

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| GET | `/cart` | カート取得 | GetCart |
| POST | `/cart` | カートに追加 | AddToCart |
| PUT | `/cart/:id` | カートアイテム更新 | UpdateCartItem |
| DELETE | `/cart/:id` | カートから削除 | RemoveFromCart |

### Order APIs（認証必須）

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| POST | `/orders` | 注文作成（仮注文） | CreateUnpaidOrder |
| GET | `/orders/payment-link` | 決済リンク取得 | CreatePaymentLink |

### Payment Webhook

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| POST | `/webhooks/payment` | 決済Webhook受信 | ProcessWebhook |

### Admin APIs（認証＋管理者権限必須）

#### 商品管理

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| POST | `/admin/products` | 商品登録 | CreateProduct |
| PUT | `/admin/products/:id` | 商品更新 | UpdateProduct |
| DELETE | `/admin/products/:id` | 商品削除 | DeleteProduct |
| PATCH | `/admin/products/:id/stock` | 在庫更新 | UpdateStock |

#### 注文管理

| Method | Endpoint | Description | UseCase |
|--------|----------|-------------|---------|
| GET | `/admin/orders` | 注文一覧 | GetOrders |
| POST | `/admin/orders/ship` | 発送処理 | ShipOrders |
| DELETE | `/admin/orders/:id` | 注文削除 | DeleteOrder |

---

## リクエスト/レスポンス例（実装予定）

### POST /auth/register

**Request**:
```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "password": "password123"
}
```

**Response** (`201 Created`):
```json
{
  "id": 1,
  "name": "山田太郎",
  "email": "yamada@example.com"
}
```

### POST /auth/login

**Request**:
```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

**Response** (`200 OK`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "isAdmin": false
  }
}
```

### POST /orders

**Request**:
```json
{
  "addressId": 1,
  "paymentType": "credit-card",
  "designationDate": "2026-03-15",
  "designationTime": "14:00-16:00"
}
```

**Response** (`201 Created`):
```json
{
  "orderId": "550e8400e29b41d4a716446655",
  "items": [],
  "totalAmount": 3765,
  "shippingFee": 1365,
  "paymentType": "credit-card"
}
```

---

## 共通仕様

### エラーレスポンス

```json
{
  "statusCode": 400,
  "message": "エラーメッセージ",
  "error": "Bad Request"
}
```

### HTTPステータスコード

| コード | 意味 |
|--------|------|
| 200 | 成功（取得・更新） |
| 201 | 作成成功 |
| 400 | バリデーションエラー |
| 401 | 認証エラー |
| 403 | 権限エラー（Admin API） |
| 404 | リソース未検出 |
| 500 | サーバーエラー |

### 認証（実装予定）

- JWT Bearer Token 方式
- `Authorization: Bearer <token>` ヘッダーで送信
- Admin APIは `isAdmin: true` のユーザーのみアクセス可能

### ページネーション（実装予定）

```
GET /products?page=1&limit=20
```

```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## API設計ガイドライン

- リソース名は複数形（`/products`, `/orders`）
- ネストは1階層まで（`/cart/items` ではなく `/cart` で統一）
- アクション系は動詞で表現（`/orders/ship`）
- 管理者用は `/admin/` プレフィックス

---

## フロントエンドからの呼び出し（現在の実装）

`FE/src/components/Home.tsx` で以下のように呼び出している:

```typescript
// 商品取得
const response = await fetch("http://localhost:3000/products");
const data: Product[] = await response.json();

// カート追加
const body = [{ UUID: productData[0].UUID, quantity: 1 }];
const response = await fetch("http://localhost:3000/cart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const data: Cart[] = await response.json();
```
