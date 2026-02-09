import { Injectable } from '@nestjs/common';
import { PostCartDto, PostedCartDto } from '../../dto/cart.dto';
import { Console } from 'console';

@Injectable()
export class CartService {
  post(postCartProducts: PostCartDto[]): PostedCartDto[] {
    const response: PostedCartDto[] = [];
    postCartProducts.forEach((product) => {
      response.push({
        product: {
          UUID: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Japanese Sword',
          price: 120,
          description: 'This isa a traditional Japanese sword.',
        },
        quantity: product.quantity,
      });
    });
    return response;
  }
}
