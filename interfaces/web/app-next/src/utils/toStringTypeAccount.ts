import { Account } from "@infrastructure/types/accounts";
import { match } from "ts-pattern";

export const toStringTypeAccount = (account: Account): string => {
  return match(account)
    .with({ type: "courant" }, () => "Compte courant")
    .with({ type: "epargne" }, () => "Compte épargne")
    .otherwise(() => "Autre");
};
