export interface ActionInterface {
  _id: string;
  name: string;
  defaultQuantity: number;
  symbol: string;
  market: string;
  activitySector: string;
  price: {
    amount: number;
    currency: string;
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
