import { Body, Controller, Get, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { PostCartDto, PostedCartDto } from '../../../dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Post()
  postCart(@Body() postCartProducts: PostCartDto[]): PostedCartDto[] {
    return this.cartService.post(postCartProducts);
  }
}
