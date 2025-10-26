import { Account } from "../types/accounts";
import { v4 as uuid } from "uuid";

export const mockAccounts: Account[] = [
  {
    id: uuid(),
    name: "Compte courant principal",
    IBAN: "FR76 1234 5678 9012 3456 7890 123",
    balance: 1523.5,
    type: "checking",
  },
  {
    id: uuid(),
    name: "Épargne vacances",
    IBAN: "FR76 0987 6543 2109 8765 4321 098",
    balance: 5420.0,
    type: "savings",
  },
  {
    id: uuid(),
    name: "Compte courant secondaire",
    IBAN: "FR76 1122 3344 5566 7788 9900 112",
    balance: 240.75,
    type: "checking",
  },
];
