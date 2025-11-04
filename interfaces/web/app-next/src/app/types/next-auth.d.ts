import { User } from '@infrastructure/types/user';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: User['role'];
      accessToken?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    accessToken?: string;
    role: User['role'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
