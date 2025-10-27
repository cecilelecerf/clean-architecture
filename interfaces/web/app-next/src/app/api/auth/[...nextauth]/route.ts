import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginFactory } from '@infrastructure/factories/users/loginFactory';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@a.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        console.log(process.env.NEXTAUTH_SECRET);
        const result = await loginFactory().execute({
          email: credentials.email,
          plainedPassword: credentials.password,
        });
        if (result instanceof Error) return null;
        return { id: result.user.id, name: result.user.lastname, email: result.user.email.value };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as 'jwt',
    secret: process.env.NEXTAUTH_SECRET,
  },
  debug: true,
};

const authHandler = NextAuth(authOptions);
export { authHandler as GET, authHandler as POST };
