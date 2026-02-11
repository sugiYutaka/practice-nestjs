export class Price {
  constructor(private readonly _amount: number) {
    if (_amount < 0) {
      throw new Error('金額は0以上である必要があります');
    }
  }

  get amount(): number {
    return this._amount;
  }
}
