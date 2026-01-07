import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@infrastructure/types/user';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = loginSchema.parse(json);
    const result = await usersFactory().login.execute({
      ...data,
      plainedPassword: data.password,
    });
    if (result instanceof Error)
      return NextResponse.json({ message: result.message }, { status: result.statusCode });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur' }, { status: 400 });
  }
}
