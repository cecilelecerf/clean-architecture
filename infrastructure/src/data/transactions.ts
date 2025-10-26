import { AccountId } from "@infrastructure/types/account";
import { Transaction, TransactionId } from "@infrastructure/types/transaction";
import { v4 as uuid } from "uuid";
import { mockAccounts } from "./accounts";

export const transactions: Transaction[] = [
  {
    id: "1" as TransactionId,
    fromAccountId: mockAccounts[0].IBAN as AccountId,
    toAccountId: mockAccounts[1].IBAN as AccountId,
    label: "Supermarché",
    amount: -45.9,
    date: new Date(),
    icon: "🛒",
    type: "debit",
  },
  {
    id: "2" as TransactionId,
    fromAccountId: mockAccounts[0].IBAN as AccountId,
    toAccountId: mockAccounts[1].IBAN as AccountId,
    label: "Virement salaire",
    amount: 2500,
    date: new Date(),
    icon: "💼",
    type: "debit",
  },
  {
    id: "3" as TransactionId,
    label: "Abonnement Netflix",
    fromAccountId: mockAccounts[0].IBAN as AccountId,
    toAccountId: mockAccounts[1].IBAN as AccountId,
    amount: -15.99,
    date: new Date(),
    icon: "🎬",
    type: "debit",
  },
];
