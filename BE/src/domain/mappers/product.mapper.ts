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
