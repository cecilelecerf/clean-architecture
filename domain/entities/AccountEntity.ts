import { UserEntity } from "./UserEntity";

export class AccountEntity {
  private constructor(
    public id: string,
    public userId: UserEntity["id"],
    // TODO add Iban
    public iban: number,
    public name: string,
    public type: "courant" | "epargne",
    public balance: number,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}
  public static from({
    id,
    userId,
    iban,
    name,
    type,
    balance,
    createdAt,
    updatedAt,
  }: {
    id: string;
    userId: UserEntity["id"];
    // TODO add Iban
    iban: number;
    name: string;
    type: "courant" | "epargne";
    balance: number;
    createdAt: Date;
    updatedAt?: Date;
  }) {
    return new AccountEntity(
      id,
      userId,
      iban,
      name,
      type,
      balance,
      createdAt,
      updatedAt
    );
  }
}
