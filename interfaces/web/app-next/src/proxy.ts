import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/accounts/:path*', '/credits/:path*', '/investments/:path*', '/threads/:path*'],
};
