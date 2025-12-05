import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
<<<<<<< HEAD:interfaces/app-next/src/app/api/auth/[...nextauth]/route.ts
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import { UserId } from '@infrastructure/types/user';
=======
import { loginFactory } from '@infrastructure/adapters/db/mysql/factories/users/loginFactory';
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/app/api/auth/[...nextauth]/route.ts

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@a.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const result = await usersFactory().login.execute({
          email: credentials.email,
          plainedPassword: credentials.password,
        });
        if (result instanceof Error) return null;

        return {
          id: result.user.id as UserId,
          name: result.user.lastname,
          email: result.user.email.toString(),
<<<<<<< HEAD:interfaces/app-next/src/app/api/auth/[...nextauth]/route.ts
          role: result.user.role,
=======
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/app/api/auth/[...nextauth]/route.ts
          image: undefined,
          accessToken: result.token,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
<<<<<<< HEAD:interfaces/app-next/src/app/api/auth/[...nextauth]/route.ts
        token.id = user.id as UserId;
=======
        token.id = user.id;
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/app/api/auth/[...nextauth]/route.ts
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
<<<<<<< HEAD:interfaces/app-next/src/app/api/auth/[...nextauth]/route.ts
      session.user.id = token.id as UserId;
=======
      session.user.id = token.id;
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/app/api/auth/[...nextauth]/route.ts
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
