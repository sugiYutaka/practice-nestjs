import { Module } from '@nestjs/common';
import { ProductController } from '../../../adapter/controllers/product.controller';
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
export class ProudctModule {}
