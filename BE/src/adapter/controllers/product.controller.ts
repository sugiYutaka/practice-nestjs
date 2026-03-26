import { Controller, Get } from '@nestjs/common';
import { ProductUsecase } from '../../usecases/product.usecase';
import { GetProductDto } from '../dto/product.dto';
import { ProductMapper } from '../mappers/product.mapper';

@Controller('products')
export class ProductController {
  constructor(private readonly productUsecase: ProductUsecase) {}
  @Get()
  async getProduct(): Promise<GetProductDto[]> {
    const products = await this.productUsecase.get();
    return products.map((product) => ProductMapper.toResponse(product));
  }
}
