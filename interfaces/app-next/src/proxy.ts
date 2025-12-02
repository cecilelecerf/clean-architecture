import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (token?.role !== 'conseiller') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  },
);

export const config = {
  matcher: [
    '/accounts/:path*',
    '/credits/:path*',
    '/investments/:path*',
    '/threads/:path*',
    '/admin/:path*',
    '/advisor/:path*',
  ],
};
