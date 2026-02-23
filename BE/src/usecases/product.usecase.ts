import { Injectable } from '@nestjs/common';
import { GetProductDto } from '../adapter/dto/product.dto';
import { ProductRepository } from '../domain/repositories/product.repository';
import { ProductMapper } from '../adapter/mappers/product.mapper';

@Injectable()
export class ProductUsecase {
  constructor(private readonly repository: ProductRepository) {}

  //ここはentityを返すべき、ここでDTOに変換はしない。Controllerでやるべき
  async get(): Promise<GetProductDto[]> {
    const data = await this.repository.findAll();
    const res = data.map((product) => ProductMapper.toResponse(product));
    return res;
  }
}
