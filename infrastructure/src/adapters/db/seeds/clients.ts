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
        credits: [
          {
            initialAmount: 5000,
            currency: "EUR",
            insuranceRate: 0.2,
            durationMonths: 24,
            startDate: new Date("2023-01-10"),
            formule : {
              interestRate : 3.0,
              type: 'Consommation',
              isActive: true
            }
          },
          {
            initialAmount: 12000,
            currency: "EUR",
            insuranceRate: 0.3,
            durationMonths: 36,
            startDate: new Date("2022-05-01"),
            formule : {
              interestRate : 3.0,
              type: 'Consommation',
              isActive: true
            }
          },  
        ] 
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
        credits : [
          {
            initialAmount: 8000,
            currency: "EUR",
            insuranceRate: 0.25,
            durationMonths: 30,
            startDate: new Date("2024-06-15"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          },
          {
            initialAmount: 15000,
            currency: "EUR",
            insuranceRate: 0.28,
            durationMonths: 48,
            startDate: new Date("2023-09-20"),
            formule : {
              interestRate : 2.0,
              type: 'Étudiant',
              isActive: true
            }
          },
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 80000,
            currency: "EUR",
            insuranceRate: 0.4,
            durationMonths: 120,
            startDate: new Date("2021-09-20"),
            formule : {
              interestRate : 2.0,
              type: 'Immobilier',
              isActive: true
            }
          },
          {
            initialAmount: 20000,
            currency: "EUR",
            insuranceRate: 0.22,
            durationMonths: 60,
            startDate: new Date("2023-03-10"),
            formule : {
              interestRate : 3.0,
              type: 'Consommation',
              isActive: true
            }
          },
          {
            initialAmount: 10000,
            currency: "EUR",
            insuranceRate: 0.3,
            durationMonths: 36,
            startDate: new Date("2024-08-01"),
            formule : {
              interestRate : 2.0,
              type: 'Étudiant',
              isActive: true
            }
          },
        ]
      },
    ],
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
        credits: [
          {
            initialAmount: 300000,
            currency: "EUR",
            insuranceRate: 0.6,
            durationMonths: 300,
            startDate: new Date("2019-06-10"),
            formule : {
              interestRate : 2.0,
              type: 'Immobilier',
              isActive: true
            }
          },
          {
            initialAmount: 25000,
            currency: "EUR",
            insuranceRate: 0.2,
            durationMonths: 48,
            startDate: new Date("2024-01-15"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          }
        ],
      },
    ],
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
        credits : [
          {
            initialAmount: 7500,
            currency: "EUR",
            insuranceRate: 0.18,
            durationMonths: 24,
            startDate: new Date("2024-05-20"),
            formule : {
              interestRate : 3.0,
              type: 'Consomation',
              isActive: true
            }
          },
          {
            initialAmount: 35000,
            currency: "EUR",
            insuranceRate: 0.28,
            durationMonths: 84,
            startDate: new Date("2023-07-10"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          }
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 40000,
            currency: "EUR",
            insuranceRate: 0.35,
            durationMonths: 84,
            startDate: new Date("2021-01-05"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          },
          {
            initialAmount: 12500,
            currency: "EUR",
            insuranceRate: 0.2,
            durationMonths: 36,
            startDate: new Date("2024-04-01"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          }
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 6000,
            currency: "EUR",
            insuranceRate: 0.1,
            durationMonths: 18,
            startDate: new Date("2023-08-01"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          },
          {
            initialAmount: 90000,
            currency: "EUR",
            insuranceRate: 0.3,
            durationMonths: 180,
            startDate: new Date("2020-12-25"),
            formule : {
              interestRate : 2.0,
              type: 'Immobilier',
              isActive: true
            }
          },
          {
            initialAmount: 28000,
            currency: "EUR",
            insuranceRate: 0.27,
            durationMonths: 60,
            startDate: new Date("2023-02-15"),
            formule : {
              interestRate : 2.0,
              type: 'Consommation',
              isActive: true
            }
          }
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 16000,
            currency: "EUR",
            insuranceRate: 0.23,
            durationMonths: 42,
            startDate: new Date("2023-12-10"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          }
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 25000,
            currency: "EUR",
            insuranceRate: 0.15,
            durationMonths: 48,
            startDate: new Date("2024-02-15"),
            formule : {
              interestRate : 2.0,
              type: 'Étudiant',
              isActive: true
            }
          },
          {
            initialAmount: 18000,
            currency: "EUR",
            insuranceRate: 0.2,
            durationMonths: 36,
            startDate: new Date("2024-03-01"),
            formule : {
              interestRate : 2.0,
              type: 'Consomation',
              isActive: true
            }
          }
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 15000,
            currency: "EUR",
            insuranceRate: 0.25,
            durationMonths: 24,
            startDate: new Date("2024-04-10"),
            formule : {
              interestRate : 2.0,
              type: 'Étudiant',
              isActive: true
            }
          },
          {
            initialAmount: 65000,
            currency: "EUR",
            insuranceRate: 0.33,
            durationMonths: 144,
            startDate: new Date("2021-06-01"),
            formule : {
              interestRate : 2.0,
              type: 'Immobilier',
              isActive: true
            }
          }
        ]
      },
    ],
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
        credits : [
          {
            initialAmount: 22000,
            currency: "EUR",
            insuranceRate: 0.15,
            durationMonths: 48,
            startDate: new Date("2024-02-28"),
            formule : {
              interestRate : 2.0,
              type: 'Automobile',
              isActive: true
            }
          },
          {
            initialAmount: 110000,
            currency: "EUR",
            insuranceRate: 0.45,
            durationMonths: 180,
            startDate: new Date("2021-04-12"),
            formule : {
              interestRate : 2.0,
              type: 'Immobilier',
              isActive: true
            }
          },
          {
            initialAmount: 32000,
            currency: "EUR",
            insuranceRate: 0.29,
            durationMonths: 72,
            startDate: new Date("2022-09-05"),
            formule : {
              interestRate : 2.0,
              type: 'Consommation',
              isActive: true
            }
          },
        ]
      },
    ],
  },
];
