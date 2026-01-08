import { NextRequest, NextResponse } from 'next/server';
import { RegisterPayload, reqRegisterSchema } from '@infrastructure/types/user';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';

const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data: RegisterPayload = reqRegisterSchema.parse(json);
    const result = await usersFactory().register.execute({
      ...data,
      confirmationUrl: clientUrl,
    });
    if (result instanceof Error)
      return NextResponse.json({ message: result.message }, { status: result.statusCode });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur' }, { status: 400 });
  }
}
