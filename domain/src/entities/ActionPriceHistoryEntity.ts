import { InvalidPriceError } from "@domain/errors/actionPriceHistory/InvalidPriceError";
import { InvalidVolumeError } from "@domain/errors/actionPriceHistory/InvalidVolumeError";

export class ActionPriceHistoryEntity {
  private constructor(
    public readonly id: string,
    public readonly isin: string,
    public readonly date: Date,
    public readonly price: number,
    public readonly volume: number,
    public readonly createdAt: Date
  ) {}

  private static validatePrice(price: number): number | InvalidPriceError {
    if (price <= 0) {
      return new InvalidPriceError(price);
    }
    return price;
  }

  private static validateVolume(volume: number): number | InvalidVolumeError {
    if (!Number.isInteger(volume) || volume < 0) {
      return new InvalidVolumeError(volume);
    }
    return volume;
  }

  public static create({
    id,
    isin,
    date,
    price,
    volume,
    createdAt,
  }: {
    id: string;
    isin: string;
    date: Date;
    price: number;
    volume: number;
    createdAt: Date;
  }): ActionPriceHistoryEntity | InvalidPriceError | InvalidVolumeError {
    const validatedPrice = this.validatePrice(price);
    if (validatedPrice instanceof Error) return validatedPrice;

    const validatedVolume = this.validateVolume(volume);
    if (validatedVolume instanceof Error) return validatedVolume;

    return new ActionPriceHistoryEntity(
      id,
      isin,
      date,
      validatedPrice,
      validatedVolume,
      createdAt
    );
  }

  public static from({
    id,
    isin,
    date,
    price,
    volume,
    createdAt,
  }: {
    id: string;
    isin: string;
    date: Date;
    price: number;
    volume: number;
    createdAt: Date;
  }): ActionPriceHistoryEntity {
    return new ActionPriceHistoryEntity(
      id,
      isin,
      date,
      price,
      volume,
      createdAt
    );
  }

  public toDTO() {
    return {
      id: this.id,
      isin: this.isin,
      date: this.date.toISOString(),
      price: this.price,
      volume: this.volume,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
