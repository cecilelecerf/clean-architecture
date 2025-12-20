import { User as UserType, UserId } from '@infrastructure/types/user';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: UserId;
      name: UserType['name'];
      email: string;
      role: UserType['role'];
      accessToken?: string;
    };
  }

  interface User {
    id: UserId;
    name: UserType['name'];
    email: string;
    accessToken?: string;
    role: UserType['role'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
