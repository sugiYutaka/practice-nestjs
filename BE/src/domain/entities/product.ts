import { Price } from '../value-object/price';

export class Product {
  constructor(
    public readonly UUID: string,
    public readonly name: string,
    public readonly price: Price,
    public readonly description?: string,
  ) {}
}
