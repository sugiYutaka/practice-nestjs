# コーディングガイドライン

## ファイル命名規則

すべてケバブケース（またはドット区切り）:

| 種類 | パターン | 実例 |
|------|---------|------|
| Entity | `{name}.ts` | `product.ts` |
| Value Object | `{name}.ts` | `price.ts` |
| Repository抽象 | `{name}.repository.ts` | `product.repository.ts` |
| Repository実装 | `prisma.{name}.ts` | `prisma.product.ts` |
| UseCase | `{name}.usecase.ts` | `product.usecase.ts` |
| Mapper | `{name}.mapper.ts` | `product.mapper.ts` |
| DTO | `{name}.dto.ts` | `product.dto.ts`, `cart.dto.ts` |
| Controller | `{name}.controller.ts` | `product.controller.ts` |
| Module | `{name}.module.ts` | `product.module.ts` |
| Service | `{name}.service.ts` | `cart.service.ts` |
| テスト | `{name}.spec.ts` | `app.controller.spec.ts` |

## クラス命名規則

| 種類 | パターン | 実例 |
|------|---------|------|
| Entity | `{Name}` | `Product` |
| Value Object | `{Name}` | `Price` |
| Repository抽象 | `{Name}Repository` | `ProductRepository` |
| Repository実装 | `Prisma{Name}` | `PrismaProduct` |
| UseCase | `{Name}Usecase` | `ProductUsecase` |
| Mapper | `{Name}Mapper` | `ProductMapper` |
| DTO（取得） | `Get{Name}Dto` | `GetProductDto` |
| DTO（送信） | `Post{Name}Dto` | `PostCartDto` |
| DTO（応答） | `Posted{Name}Dto` | `PostedCartDto` |
| Controller | `{Name}Controller` | `ProductController` |
| Module | `{Name}Module` | `CartModule` |
| Service | `{Name}Service` | `CartService` |

## ディレクトリ構造

### バックエンド（現在）

```
BE/src/
├── domain/
│   ├── entities/
│   │   └── product.ts
│   ├── value-object/
│   │   └── price.ts
│   ├── repositories/
│   │   └── product.repository.ts
│   └── mappers/
│       └── product.mapper.ts
├── usecases/
│   └── product.usecase.ts
├── dto/
│   ├── product.dto.ts
│   └── cart.dto.ts
└── infrastracture/
    ├── prisma/
    │   └── prisma.product.ts
    └── modules/
        ├── product/
        │   ├── product.module.ts
        │   └── product.controller.ts
        └── cart/
            ├── cart.module.ts
            ├── cart.controller.ts
            └── cart.service.ts
```

### フロントエンド

```
FE/src/
├── main.tsx
├── App.tsx
├── App.css
├── index.css
├── components/
│   └── Home.tsx
└── assets/
    └── react.svg
```

### 新ドメイン追加時のテンプレート

新しいドメイン `{domain}` を追加する際の構成:

```
BE/src/
├── domain/
│   ├── entities/
│   │   └── {domain}.ts
│   ├── value-object/
│   │   └── （必要に応じて追加）
│   ├── repositories/
│   │   └── {domain}.repository.ts
│   └── mappers/
│       └── {domain}.mapper.ts
├── usecases/
│   └── {domain}.usecase.ts
├── dto/
│   └── {domain}.dto.ts
└── infrastracture/
    ├── prisma/
    │   └── prisma.{domain}.ts
    └── modules/
        └── {domain}/
            ├── {domain}.module.ts
            └── {domain}.controller.ts
```

## コードテンプレート

### Entity

```typescript
import { Price } from '../value-object/price';

export class Product {
  constructor(
    public readonly UUID: string,
    public readonly name: string,
    public readonly price: Price,
    public readonly description?: string,
  ) {}
}
```

### Value Object

```typescript
export class Price {
  constructor(private readonly _amount: number) {
    if (_amount < 0) {
      throw new Error('金額は0以上である必要があります');
    }
  }

  get amount(): number {
    return this._amount;
  }
}
```

### Repository 抽象

```typescript
import { Product } from '../entities/product';

export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract create(data: Product): Promise<Product>;
}
```

### DTO

```typescript
export class GetProductDto {
  UUID: string;
  name: string;
  price: number;
  description?: string;
}
```

### Mapper（static メソッド）

```typescript
import { GetProductDto } from '../../dto/product.dto';
import { Product } from '../entities/product';
import { Price } from '../value-object/price';

export class ProductMapper {
  static toResponse(product: Product): GetProductDto {
    return {
      UUID: product.UUID,
      name: product.name,
      description: product.description,
      price: product.price.amount,
    };
  }
  static toEntity(request: GetProductDto): Product {
    return {
      UUID: request.UUID,
      name: request.name,
      description: request.description,
      price: new Price(request.price),
    };
  }
}
```

### UseCase

```typescript
import { Injectable } from '@nestjs/common';
import { GetProductDto } from '../dto/product.dto';
import { ProductRepository } from '../domain/repositories/product.repository';
import { ProductMapper } from '../domain/mappers/product.mapper';

@Injectable()
export class ProductUsecase {
  constructor(private readonly repository: ProductRepository) {}

  async get(): Promise<GetProductDto[]> {
    const data = await this.repository.findAll();
    const res = data.map((product) => ProductMapper.toResponse(product));
    return res;
  }
}
```

### Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { ProductUsecase } from '../../../usecases/product.usecase';
import { GetProductDto } from '../../../dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productUsecase: ProductUsecase) {}
  @Get()
  async getProduct(): Promise<GetProductDto[]> {
    return await this.productUsecase.get();
  }
}
```

### Module（DI設定）

```typescript
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductUsecase } from '../../../usecases/product.usecase';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { PrismaProduct } from '../../prisma/prisma.product';

@Module({
  controllers: [ProductController],
  providers: [
    ProductUsecase,
    {
      provide: ProductRepository,
      useFactory: () => new PrismaProduct(),
    },
  ],
})
export class ProductModule {}
```

## インポート規約

- 現在は相対パスを使用
- `@/core/*` エイリアスが tsconfig に定義済み（今後活用予定）
- NestJS デコレータは `@nestjs/common` からインポート

```typescript
// 現在のスタイル（相対パス）
import { Product } from '../../domain/entities/product';
import { ProductRepository } from '../../../domain/repositories/product.repository';
```

## テスト方針

### テスト対象と優先度

| レイヤー | テスト種別 | 優先度 | 現在の状態 |
|---------|-----------|--------|-----------|
| Mapper | 単体テスト | **必須** | 未実装 |
| UseCase | 単体テスト（リポジトリをモック） | **必須** | 未実装 |
| Value Object | 単体テスト | **必須** | 未実装 |
| Controller | E2Eテスト | 推奨 | テンプレートのみ |
| Repository実装 | 統合テスト | 推奨 | 未実装 |

### テストファイルの配置

テスト対象ファイルと同じディレクトリに `*.spec.ts` として配置。
E2Eテストは `BE/test/` に配置。

## 開発コマンド

### バックエンド

```bash
cd BE
npm run start:dev    # 開発サーバー起動（ホットリロード）
npm run build        # ビルド
npm run test         # 単体テスト
npm run test:e2e     # E2Eテスト
npm run lint         # ESLint
npm run format       # Prettier
```

### フロントエンド

```bash
cd FE
npm run dev          # 開発サーバー起動
npm run build        # ビルド
npm run lint         # ESLint
```

## 禁止パターン

1. **依存方向の逆転**: `domain/` から `infrastracture/` や `usecases/` をインポートしない
2. **Controller にロジック**: Controller は UseCase / Service の呼び出しのみ
3. **Entity に NestJS デコレータ**: ドメイン層はフレームワーク非依存
4. **Repository 実装の直接使用**: 抽象クラスを経由して DI で注入
5. **DTO の Entity 代用**: DTO と Entity は明確に分離
6. **ハードコードされたマジックナンバー**: 定数/設定ファイルに切り出す
7. **トランザクションなしの複数テーブル更新**: データ整合性のためトランザクション必須（DB接続後）
