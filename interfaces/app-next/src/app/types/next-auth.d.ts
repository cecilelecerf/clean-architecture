import { User, UserId } from '@infrastructure/types/user';
declare module 'next-auth' {
  interface Session {
    user: {
      id: UserId;
      name: User['name'];
      email: string;
      role: User['role'];
      accessToken?: string;
    };
  }

  interface User {
    id: UserId;
    name: User['name'];
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
