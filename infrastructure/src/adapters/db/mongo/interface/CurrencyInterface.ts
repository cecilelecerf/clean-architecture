export interface CurrencyInterface {
  _id: string;
  code: string;
  exchangeRate: number;
  createdAt: Date;
  updatedAt?: Date;
}
