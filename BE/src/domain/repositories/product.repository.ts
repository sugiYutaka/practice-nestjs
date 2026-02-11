import { Product } from '../entities/product';
export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract create(data: Product): Promise<Product>;
}
