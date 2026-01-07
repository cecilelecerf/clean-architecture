import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { userDtoSchema, UserId } from '@infrastructure/types/user';
import z from 'zod';
import { tokenSchema } from '@/utils/endpoint/authEndpoint';
import { safeParseWithLog } from '@/lib/zodUtils';

const responseSchema = z.object({
  user: userDtoSchema,
  token: tokenSchema.shape.token,
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@a.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        console.log(credentials);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const json = await res.json();
        console.log(json);
        const result = safeParseWithLog(responseSchema, json);
        return {
          id: result.user.id,
          name: result.user.lastname,
          email: result.user.email,
          role: result.user.role,
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
        token.id = user.id as UserId;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as UserId;
      session.user.email = token.email;
      session.user.accessToken = token.accessToken;
      session.user.role = token.role as 'client' | 'conseiller' | 'directeur';
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
