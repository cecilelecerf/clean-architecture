// src/lib/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  pathnames: {
    // Pages publiques
    '/': {
      fr: '/',
      en: '/',
    },
    '/login': {
      fr: '/connexion',
      en: '/login',
    },
    '/register': {
      fr: '/inscription',
      en: '/register',
    },
    '/forgot-password': {
      fr: '/mot-de-passe-oublie',
      en: '/forgot-password',
    },
    '/reset-password': {
      fr: '/reinitialiser-mot-de-passe',
      en: '/reset-password',
    },
    '/confirm-email': {
      fr: '/confirmer-email',
      en: '/confirm-email',
    },

    // Comptes
    '/accounts': {
      fr: '/comptes',
      en: '/accounts',
    },
    '/accounts/new': {
      fr: '/comptes/nouveau',
      en: '/accounts/new',
    },
    '/accounts/[accountId]': {
      fr: '/comptes/[accountId]',
      en: '/accounts/[accountId]',
    },
    '/accounts/[accountId]/transactions': {
      fr: '/comptes/[accountId]/transactions',
      en: '/accounts/[accountId]/transactions',
    },
    '/accounts/[accountId]/transactions/new': {
      fr: '/comptes/[accountId]/transactions/nouvelle',
      en: '/accounts/[accountId]/transactions/new',
    },
    '/accounts/[accountId]/transactions/[transactionId]': {
      fr: '/comptes/[accountId]/transactions/[transactionId]',
      en: '/accounts/[accountId]/transactions/[transactionId]',
    },

    // Actions (Stocks)
    '/actions': {
      fr: '/actions',
      en: '/stocks',
    },
    '/actions/explore': {
      fr: '/actions/explorer',
      en: '/stocks/explore',
    },
    '/actions/[isin]': {
      fr: '/actions/[isin]',
      en: '/stocks/[isin]',
    },

    // Crédits
    '/credits': {
      fr: '/credits',
      en: '/loans',
    },
    '/credits/[creditId]': {
      fr: '/credits/[creditId]',
      en: '/loans/[creditId]',
    },
    '/credits/[creditId]/monthly-paiement': {
      fr: '/credits/[creditId]/mensualites',
      en: '/loans/[creditId]/monthly-payment',
    },
    '/credits/formules': {
      fr: '/credits/formules',
      en: '/loans/plans',
    },
    '/credits/formules/[formuleId]': {
      fr: '/credits/formules/[formuleId]',
      en: '/loans/plans/[formuleId]',
    },
    '/credits/request/[formuleId]': {
      fr: '/credits/demande/[formuleId]',
      en: '/loans/request/[formuleId]',
    },
    '/credits/simulate/[formuleId]': {
      fr: '/credits/simuler/[formuleId]',
      en: '/loans/simulate/[formuleId]',
    },

    // Taux d'épargne
    '/savings-rate': {
      fr: '/taux-epargne',
      en: '/savings-rate',
    },

    // Fils de discussion
    '/threads': {
      fr: '/discussions',
      en: '/threads',
    },
    '/threads/new': {
      fr: '/discussions/nouvelle',
      en: '/threads/new',
    },
    '/threads/[threadId]': {
      fr: '/discussions/[threadId]',
      en: '/threads/[threadId]',
    },

    // Actualités
    '/feeds': {
      fr: '/actualites',
      en: '/feeds',
    },
    '/feeds/[postId]': {
      fr: '/actualites/[postId]',
      en: '/feeds/[postId]',
    },

    // Profil
    '/profil': {
      fr: '/profil',
      en: '/profile',
    },

    // ========== ADMIN ==========
    '/admin': {
      fr: '/admin',
      en: '/admin',
    },
    '/admin/profile': {
      fr: '/admin/profil',
      en: '/admin/profile',
    },

    // Admin - Utilisateurs
    '/admin/users': {
      fr: '/admin/utilisateurs',
      en: '/admin/users',
    },
    '/admin/users/[userId]': {
      fr: '/admin/utilisateurs/[userId]',
      en: '/admin/users/[userId]',
    },

    // Admin - Comptes
    '/admin/accounts': {
      fr: '/admin/comptes',
      en: '/admin/accounts',
    },
    '/admin/accounts/[accountIban]': {
      fr: '/admin/comptes/[accountIban]',
      en: '/admin/accounts/[accountIban]',
    },
    '/admin/accounts/[accountIban]/transactions': {
      fr: '/admin/comptes/[accountIban]/transactions',
      en: '/admin/accounts/[accountIban]/transactions',
    },
    '/admin/accounts/[accountIban]/transactions/[transactionId]': {
      fr: '/admin/comptes/[accountIban]/transactions/[transactionId]',
      en: '/admin/accounts/[accountIban]/transactions/[transactionId]',
    },

    // Admin - Comptes bancaires
    '/admin/bank-accounts': {
      fr: '/admin/comptes-bancaires',
      en: '/admin/bank-accounts',
    },
    '/admin/bank-accounts/[accountIban]': {
      fr: '/admin/comptes-bancaires/[accountIban]',
      en: '/admin/bank-accounts/[accountIban]',
    },
    '/admin/bank-accounts/[accountIban]/transactions': {
      fr: '/admin/comptes-bancaires/[accountIban]/transactions',
      en: '/admin/bank-accounts/[accountIban]/transactions',
    },
    '/admin/bank-accounts/[accountIban]/transactions/[transactionId]': {
      fr: '/admin/comptes-bancaires/[accountIban]/transactions/[transactionId]',
      en: '/admin/bank-accounts/[accountIban]/transactions/[transactionId]',
    },

    // Admin - Crédits
    '/admin/credits': {
      fr: '/admin/credits',
      en: '/admin/loans',
    },
    '/admin/credits/[creditId]': {
      fr: '/admin/credits/[creditId]',
      en: '/admin/loans/[creditId]',
    },

    // Admin - Fils de discussion
    '/admin/threads': {
      fr: '/admin/discussions',
      en: '/admin/threads',
    },
    '/admin/threads/[threadId]': {
      fr: '/admin/discussions/[threadId]',
      en: '/admin/threads/[threadId]',
    },
    '/admin/client-threads': {
      fr: '/admin/discussions-clients',
      en: '/admin/client-threads',
    },
    '/admin/client-threads/[threadId]': {
      fr: '/admin/discussions-clients/[threadId]',
      en: '/admin/client-threads/[threadId]',
    },

    // Admin - Actualités
    '/admin/feeds': {
      fr: '/admin/actualites',
      en: '/admin/feeds',
    },
    '/admin/feeds/new': {
      fr: '/admin/actualites/nouvelle',
      en: '/admin/feeds/new',
    },
    '/admin/feeds/[postId]': {
      fr: '/admin/actualites/[postId]',
      en: '/admin/feeds/[postId]',
    },

    // ========== DIRECTOR ==========
    '/director': {
      fr: '/directeur',
      en: '/director',
    },
    '/director/profile': {
      fr: '/directeur/profil',
      en: '/director/profile',
    },

    // Director - Utilisateurs
    '/director/users': {
      fr: '/directeur/utilisateurs',
      en: '/director/users',
    },
    '/director/users/new': {
      fr: '/directeur/utilisateurs/nouveau',
      en: '/director/users/new',
    },
    '/director/users/[userId]': {
      fr: '/directeur/utilisateurs/[userId]',
      en: '/director/users/[userId]',
    },

    // Director - Actions
    '/director/actions': {
      fr: '/directeur/actions',
      en: '/director/stocks',
    },
    '/director/actions/new': {
      fr: '/directeur/actions/nouvelle',
      en: '/director/stocks/new',
    },
    '/director/actions/[isin]': {
      fr: '/directeur/actions/[isin]',
      en: '/director/stocks/[isin]',
    },
    '/director/actions/[isin]/edit': {
      fr: '/directeur/actions/[isin]/modifier',
      en: '/director/stocks/[isin]/edit',
    },

    // Director - Devises
    '/director/currencies': {
      fr: '/directeur/devises',
      en: '/director/currencies',
    },

    // Director - Formules de crédit
    '/director/formules': {
      fr: '/directeur/formules',
      en: '/director/plans',
    },
    '/director/formules/new': {
      fr: '/directeur/formules/nouvelle',
      en: '/director/plans/new',
    },
    '/director/formules/[formuleId]': {
      fr: '/directeur/formules/[formuleId]',
      en: '/director/plans/[formuleId]',
    },
    '/director/formules/[formuleId]/update': {
      fr: '/directeur/formules/[formuleId]/modifier',
      en: '/director/plans/[formuleId]/update',
    },

    // Director - Taux d'épargne
    '/director/savings-rate': {
      fr: '/directeur/taux-epargne',
      en: '/director/savings-rate',
    },
    '/director/savings-rate/new': {
      fr: '/directeur/taux-epargne/nouveau',
      en: '/director/savings-rate/new',
    },

    // Director - Fils de discussion
    '/director/threads': {
      fr: '/directeur/discussions',
      en: '/director/threads',
    },
    '/director/threads/new': {
      fr: '/directeur/discussions/nouvelle',
      en: '/director/threads/new',
    },
    '/director/threads/[threadId]': {
      fr: '/directeur/discussions/[threadId]',
      en: '/director/threads/[threadId]',
    },
  },
});
