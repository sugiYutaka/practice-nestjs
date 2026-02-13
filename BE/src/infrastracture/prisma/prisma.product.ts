import { Product } from '../../domain/entities/product';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Price } from '../../domain/value-object/price';
import { GetProductDto } from '../../adapter/dto/product.dto';

export class PrismaProduct implements ProductRepository {
  async findAll() {
    const data: Product[] = [
      {
        UUID: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Sample Product',
        description: 'This is a sample product.',
        price: new Price(1000),
      },
    ];
    return data;
  }
  async create(data: Product) {
    const created: Product = {
      UUID: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Sample Product',
      description: 'This is a sample product.',
      price: new Price(1000),
    };
    return created;
  }
}
