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
