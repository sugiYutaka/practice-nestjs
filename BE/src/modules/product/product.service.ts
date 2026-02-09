import { Injectable } from '@nestjs/common';
import { GetProductDto } from '../../dto/product.dto';

@Injectable()
export class ProductService {
  get(): GetProductDto[] {
    return [
      {
        UUID: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Japanese Sword',
        price: 120,
        description: 'This isa a traditional Japanese sword.',
      },
      {
        UUID: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Samurai Armor',
        price: 300,
        description: 'This is a traditional Samurai armor.',
      },
      {
        UUID: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Grean Tea',
        price: 80,
        description: 'This is a high-quality green tea from Japan.',
      },
    ];
  }
}
