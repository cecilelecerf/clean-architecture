import { Account, AccountId } from "../types/account";
import { v4 as uuid } from "uuid";

export const mockAccounts: Account[] = [
  {
    name: "Compte courant principal",
    IBAN: "FR76 1234 5678 9012 3456 7890 123" as AccountId,
    balance: 1523.5,
    type: "courant",
    color: "blue",
  },
  {
    name: "Épargne vacances",
    IBAN: "FR76 0987 6543 2109 8765 4321 098" as AccountId,
    balance: 5420.0,
    type: "epargne",
    color: "purple",
  },
  {
    name: "Compte courant secondaire",
    IBAN: "FR76 1122 3344 5566 7788 9900 112" as AccountId,
    balance: 240.75,
    type: "courant",
    color: "gray",
  },
];
