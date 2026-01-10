import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],

  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  // pathnames: {
  //   '/admin/users': {
  //     fr: '/admin/utilisateurs',
  //     en: '/admin/users',
  //   },
  // },
});
