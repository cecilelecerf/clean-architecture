export const rawBankAccounts = [
  {
    name: "Compte interêt",
    type: "epargne" as const,
    color: "blue" as const,
    balance: 15000000,
    currency: "EUR",
  },
  {
    name: "Compte prêt",
    type: "pret" as const,
    color: "red" as const,
    balance: 25000000,
    currency: "EUR",
  },
  {
    name: "Compte de réserve",
    type: "courant" as const,
    color: "purple" as const,
    balance: 1500000,
    currency: "EUR",
  },
];
