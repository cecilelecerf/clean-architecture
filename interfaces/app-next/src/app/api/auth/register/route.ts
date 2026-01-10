import { NextRequest, NextResponse } from 'next/server';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import { createClientSchema } from '@infrastructure/types/user';

const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = createClientSchema.parse(json);
    const result = await usersFactory().register.execute({
      ...data,
      plainedPassword: data.passwordHash,
      address: {
        city: data.city,
        address: data.address,
        postalCode: data.postalCode,
        country: data.country,
      },
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
