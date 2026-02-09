import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';
import { GetProductDto } from '../../dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Get()
  getProduct(): GetProductDto[] {
    return this.productService.get();
  }
}
