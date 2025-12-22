import { NextRequest, NextResponse } from 'next/server';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import { resetPasswordSchema } from '@/utils/endpoint/authEndpoint';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const { token, password } = resetPasswordSchema.parse(json);
    const result = await usersFactory().resetPassword.execute({
      token,
      newPassword: password,
    });

    if (result instanceof Error) {
      return NextResponse.json({ name: result.name, message: result.message }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
