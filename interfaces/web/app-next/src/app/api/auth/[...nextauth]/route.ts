import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginFactory } from '@infrastructure/adapters/db/mysql/factories/users/loginFactory';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@a.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const result = await loginFactory().execute({
          email: credentials.email,
          plainedPassword: credentials.password,
        });
        if (result instanceof Error) return null;

        return {
          id: result.user.id,
          name: result.user.lastname,
          email: result.user.email.toString(),
          role: result.user.role,
          image: undefined,
          accessToken: result.token,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const authHandler = NextAuth(authOptions);
export { authHandler as GET, authHandler as POST };
