import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: {
      common: (await import(`../../../messages/common/${locale}.json`)).default,
      home: (await import(`../../../messages/home/${locale}.json`)).default,
      auth: (await import(`../../../messages/auth/${locale}.json`)).default,
      director: (await import(`../../../messages/director/${locale}.json`)).default,
      advisor: (await import(`../../../messages/advisor/${locale}.json`)).default,
    },
  };
});
