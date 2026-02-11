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
