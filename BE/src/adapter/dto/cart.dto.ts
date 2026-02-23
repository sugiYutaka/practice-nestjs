import { GetProductDto } from './product.dto';

export class PostCartDto {
  UUID: string;
  quantity: number;
}
export class PostedCartDto {
  product: GetProductDto;
  quantity: number;
}
