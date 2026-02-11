import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProudctModule } from './infrastracture/modules/product/product.module';
import { CartModule } from './infrastracture/modules/cart/cart.module';

@Module({
  imports: [ProudctModule, CartModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
