import { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

function getLocalizedPath(pathname: string, locale: 'en' | 'fr'): string {
  const fullPathname = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;

  const pathConfig = routing.pathnames[fullPathname as keyof typeof routing.pathnames];

  if (!pathConfig) return fullPathname;

  if (typeof pathConfig === 'string') {
    return pathConfig;
  }

  return pathConfig[locale] || fullPathname;
}

interface SitemapEntry {
  path: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const staticRoutes: SitemapEntry[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },

  { path: '/login', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/register', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/forgot-password', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/reset-password', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/confirm-email', priority: 0.3, changeFrequency: 'yearly' },

  { path: '/profil', priority: 0.6, changeFrequency: 'monthly' },

  { path: '/accounts', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/accounts/new', priority: 0.5, changeFrequency: 'monthly' },

  { path: '/actions', priority: 0.8, changeFrequency: 'daily' },
  { path: '/actions/explore', priority: 0.9, changeFrequency: 'daily' },

  { path: '/credits', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/credits/formules', priority: 0.8, changeFrequency: 'weekly' },

  { path: '/feeds', priority: 0.9, changeFrequency: 'daily' },

  { path: '/savings-rate', priority: 0.7, changeFrequency: 'weekly' },

  { path: '/threads', priority: 0.6, changeFrequency: 'daily' },
  { path: '/threads/new', priority: 0.5, changeFrequency: 'monthly' },

  { path: '/admin', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/admin/profile', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/admin/accounts', priority: 0.4, changeFrequency: 'daily' },

  { path: '/admin/bank-accounts', priority: 0.4, changeFrequency: 'daily' },

  { path: '/admin/client-threads', priority: 0.4, changeFrequency: 'daily' },

  { path: '/admin/credits', priority: 0.4, changeFrequency: 'daily' },

  { path: '/admin/feeds', priority: 0.4, changeFrequency: 'daily' },
  { path: '/admin/feeds/new', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/admin/threads', priority: 0.4, changeFrequency: 'daily' },

  { path: '/admin/users', priority: 0.4, changeFrequency: 'daily' },

  { path: '/director', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/director/profile', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/director/actions', priority: 0.4, changeFrequency: 'daily' },
  { path: '/director/actions/new', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/director/currencies', priority: 0.4, changeFrequency: 'weekly' },

  { path: '/director/formules', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/director/formules/new', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/director/savings-rate', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/director/savings-rate/new', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/director/threads', priority: 0.4, changeFrequency: 'daily' },
  { path: '/director/threads/new', priority: 0.4, changeFrequency: 'monthly' },

  { path: '/director/users', priority: 0.4, changeFrequency: 'daily' },
  { path: '/director/users/new', priority: 0.4, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    staticRoutes.forEach(({ path, changeFrequency, priority }) => {
      const localizedPath = getLocalizedPath(path, locale);

      const url =
        locale === routing.defaultLocale
          ? `${BASE_URL}${localizedPath}`
          : `${BASE_URL}/${locale}${localizedPath}`;

      staticEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: changeFrequency || 'monthly',
        priority: priority || 0.5,
      });
    });
  });

  return staticEntries;
}
