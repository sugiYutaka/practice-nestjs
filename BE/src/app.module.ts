import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProudctModule } from './modules/product/product.module';

@Module({
  imports: [ProudctModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
