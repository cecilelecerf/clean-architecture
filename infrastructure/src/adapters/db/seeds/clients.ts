import { Color } from "@domain/values/Color";

export const rawClients = [
  {
    firstname: "client",
    lastname: "client",
    email: "client@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "blue" as const,
        balance: 1500,
        currency: "EUR",
        transactions: [
          {
            amount: 500,
            currency: "EUR",
            type: "debit" as const,
            label: "Salaire",
            date: new Date("2025-10-28T10:00:00Z"),
            icon: "💰",
          },
          {
            amount: 50,
            currency: "EUR",
            type: "debit" as const,
            label: "Courses",
            date: new Date("2025-10-29T14:30:00Z"),
            icon: "🛒",
          },
        ],
      },
      {
        name: "Compte épargne",
        type: "epargne" as const,
        color: "red" as const,
        balance: 5000,
        currency: "EUR",
        transactions: [
          {
            amount: 200,
            currency: "EUR",
            type: "credit" as const,
            label: "Prime",
            date: new Date("2025-10-30T08:00:00Z"),
            icon: "🏆",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 5000,
        currency: "EUR",
        interestRate: 2.1,
        insuranceRate: 0.2,
        durationMonths: 24,
        startDate: new Date("2023-01-10")
      },
      {
        initialAmount: 12000,
        currency: "EUR",
        interestRate: 3.5,
        insuranceRate: 0.3,
        durationMonths: 36,
        startDate: new Date("2022-05-01")
      },
    ]
  },
  {
    firstname: "Benjamin",
    lastname: "Martin",
    email: "benjamin.martin@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "blue" as const,
        balance: 1200,
        currency: "EUR",
        transactions: [
          {
            amount: 300,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-25T09:00:00Z"),
            icon: "💰",
          },
          {
            amount: 75,
            currency: "EUR",
            type: "debit" as const,
            label: "Facture Internet",
            date: new Date("2025-10-26T12:00:00Z"),
            icon: "🌐",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 80000,
        currency: "EUR",
        interestRate: 3.2,
        insuranceRate: 0.4,
        durationMonths: 120,
        startDate: new Date("2021-09-20")
      }
    ]
  },
  {
    firstname: "Claire",
    lastname: "Leroy",
    email: "claire.leroy@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "purple" as string,
        balance: 900,
        currency: "EUR",
        transactions: [
          {
            amount: 400,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-27T10:00:00Z"),
            icon: "💰",
          },
          {
            amount: 60,
            currency: "EUR",
            type: "debit" as const,
            label: "Courses",
            date: new Date("2025-10-28T14:00:00Z"),
            icon: "🛒",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 150000,
        currency: "EUR",
        interestRate: 4.5,
        insuranceRate: 0.5,
        durationMonths: 240,
        startDate: new Date("2020-03-01")
      },
      {
        initialAmount: 300000,
        currency: "EUR",
        interestRate: 3.8,
        insuranceRate: 0.6,
        durationMonths: 300,
        startDate: new Date("2019-06-10")
      }
    ]
  },
  {
    firstname: "David",
    lastname: "Moreau",
    email: "david.moreau@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "orange" as const,
        balance: 1100,
        currency: "EUR",
        transactions: [
          {
            amount: 500,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-25T09:00:00Z"),
            icon: "💰",
          },
          {
            amount: 120,
            currency: "EUR",
            type: "debit" as const,
            label: "Essence",
            date: new Date("2025-10-26T11:30:00Z"),
            icon: "⛽",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 18000,
        currency: "EUR",
        interestRate: 2.4,
        insuranceRate: 0.25,
        durationMonths: 60,
        startDate: new Date("2022-11-12")
      }
    ]
  },
  {
    firstname: "Emma",
    lastname: "Bernard",
    email: "emma.bernard@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "pink" as const,
        balance: 1300,
        currency: "EUR",
        transactions: [
          {
            amount: 450,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-27T08:00:00Z"),
            icon: "💰",
          },
          {
            amount: 80,
            currency: "EUR",
            type: "debit" as const,
            label: "Restaurant",
            date: new Date("2025-10-28T20:00:00Z"),
            icon: "🍽️",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 40000,
        currency: "EUR",
        interestRate: 2.7,
        insuranceRate: 0.35,
        durationMonths: 84,
        startDate: new Date("2021-01-05")
      }
    ]
  },
  {
    firstname: "Florent",
    lastname: "Girard",
    email: "florent.girard@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "green" as const,
        balance: 1000,
        currency: "EUR",
        transactions: [
          {
            amount: 400,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-28T09:00:00Z"),
            icon: "💰",
          },
          {
            amount: 50,
            currency: "EUR",
            type: "debit" as const,
            label: "Courses",
            date: new Date("2025-10-29T15:00:00Z"),
            icon: "🛒",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 6000,
        currency: "EUR",
        interestRate: 1.5,
        insuranceRate: 0.1,
        durationMonths: 18,
        startDate: new Date("2023-08-01")
      },
      {
        initialAmount: 90000,
        currency: "EUR",
        interestRate: 2.9,
        insuranceRate: 0.3,
        durationMonths: 180,
        startDate: new Date("2020-12-25")
      }
    ]
  },
  {
    firstname: "Julie",
    lastname: "Mercier",
    email: "julie.mercier@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "red" as const,
        balance: 950,
        currency: "EUR",
        transactions: [
          {
            amount: 500,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-28T10:00:00Z"),
            icon: "💰",
          },
          {
            amount: 70,
            currency: "EUR",
            type: "debit" as const,
            label: "Shopping",
            date: new Date("2025-10-29T12:00:00Z"),
            icon: "🛍️",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 25000,
        currency: "EUR",
        interestRate: 1.9,
        insuranceRate: 0.15,
        durationMonths: 48,
        startDate: new Date("2024-02-15")
      }
    ]
  },
  {
    firstname: "Kevin",
    lastname: "Renaud",
    email: "kevin.renaud@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "orange" as const,
        balance: 1400,
        currency: "EUR",
        transactions: [
          {
            amount: 600,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-27T09:00:00Z"),
            icon: "💰",
          },
          {
            amount: 100,
            currency: "EUR",
            type: "debit" as const,
            label: "Essence",
            date: new Date("2025-10-28T18:00:00Z"),
            icon: "⛽",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 25000,
        currency: "EUR",
        interestRate: 1.9,
        insuranceRate: 0.15,
        durationMonths: 48,
        startDate: new Date("2024-02-15")
      },
      {
        initialAmount: 18000,
        currency: "EUR",
        interestRate: 2.1,
        insuranceRate: 0.2,
        durationMonths: 36,
        startDate: new Date("2024-03-01")
      }
    ]
  },
  {
    firstname: "Lucie",
    lastname: "Petit",
    email: "lucie.petit@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "green" as const,
        balance: 1150,
        currency: "EUR",
        transactions: [
          {
            amount: 500,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-28T09:30:00Z"),
            icon: "💰",
          },
          {
            amount: 60,
            currency: "EUR",
            type: "debit" as const,
            label: "Courses",
            date: new Date("2025-10-29T14:00:00Z"),
            icon: "🛒",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 30000,
        currency: "EUR",
        interestRate: 1.7,
        insuranceRate: 0.1,
        durationMonths: 60,
        startDate: new Date("2024-01-20")
      },
      {
        initialAmount: 15000,
        currency: "EUR",
        interestRate: 2.5,
        insuranceRate: 0.25,
        durationMonths: 24,
        startDate: new Date("2024-04-10")
      }
    ]
  },
  {
    firstname: "Maxime",
    lastname: "Robert",
    email: "maxime.robert@example.com",
    password: "password123",
    accounts: [
      {
        name: "Compte courant",
        type: "courant" as const,
        color: "gray" as const,
        balance: 1300,
        currency: "EUR",
        transactions: [
          {
            amount: 700,
            currency: "EUR",
            type: "credit" as const,
            label: "Salaire",
            date: new Date("2025-10-28T08:00:00Z"),
            icon: "💰",
          },
          {
            amount: 90,
            currency: "EUR",
            type: "debit" as const,
            label: "Restaurant",
            date: new Date("2025-10-29T19:00:00Z"),
            icon: "🍽️",
          },
        ],
      },
    ],
    credits : [
      {
        initialAmount: 22000,
        currency: "EUR",
        interestRate: 2.0,
        insuranceRate: 0.15,
        durationMonths: 48,
        startDate: new Date("2024-02-28")
      }
    ]
  },
];
