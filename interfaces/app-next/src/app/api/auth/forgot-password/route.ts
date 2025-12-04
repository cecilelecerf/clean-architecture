import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD:interfaces/app-next/src/app/api/auth/forgot-password/route.ts
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
=======
import { forgotPasswordFactory } from '@infrastructure/adapters/db/mysql/factories/users/forgotPasswordFactory';
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/app/api/auth/forgot-password/route.ts

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Email requis' }, { status: 400 });

    const result = await usersFactory().forgotPassword.execute({
      email,
      confirmationUrl: process.env.FRONTEND_URL,
    });

    if (result instanceof Error) {
      return NextResponse.json({ name: result.name, message: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: 'Email de réinitialisation envoyé !' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
