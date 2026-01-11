import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const publicRoutes = [
  '/',
  '/login',
  '/fr/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/confirm-email',
];

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

    if (publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      return intlMiddleware(req as NextRequest);
    }

    const token = req.nextauth.token;
    const locale = pathname.match(/^\/(en|fr)/)?.[1] || 'fr';

    if (pathnameWithoutLocale.includes('/admin')) {
      if (token?.role !== 'conseiller') {
        return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
      }
    }

    if (pathnameWithoutLocale.includes('/director')) {
      if (token?.role !== 'directeur') {
        return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
      }
    }

    return intlMiddleware(req as NextRequest);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

        // Autoriser les routes publiques sans token
        if (publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
          return true;
        }

        // Sinon, vérifier le token
        return !!token;
      },
    },
    pages: {
      signIn: '/fr/login',
    },
  },
);

export const config = {
  matcher: [
    // Toutes les routes sauf api, _next, etc.
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
