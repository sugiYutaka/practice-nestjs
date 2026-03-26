import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../domain/repositories/product.repository';
import { Product } from '../domain/entities/product';

@Injectable()
export class ProductUsecase {
  constructor(private readonly repository: ProductRepository) {}

  async get(): Promise<Product[]> {
    return await this.repository.findAll();
  }
}
