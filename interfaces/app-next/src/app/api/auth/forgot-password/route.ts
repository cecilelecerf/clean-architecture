import { NextRequest, NextResponse } from 'next/server';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const result = await usersFactory().forgotPassword.execute({
      email,
      confirmationUrl: process.env.NEXT_PUBLIC_CLIENT_URL,
    });

    if (result instanceof Error) {
      return NextResponse.json({ name: result.name, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
