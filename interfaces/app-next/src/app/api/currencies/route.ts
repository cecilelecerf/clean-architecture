import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { currencyFactory } from '@infrastructure/adapters/db/mysql/factories/currency';

import { createCurrencySchema, currencySchema } from '@infrastructure/types/currency';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await currencyFactory().listCurrencies.execute();

    if (result instanceof Error) {
      return NextResponse.json({ name: result.name, message: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const payload = createCurrencySchema.parse(body);

    const result = await currencyFactory().admin.createCurrency.execute({
      actorId: session.user.id,
      ...payload,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: (result as any).statusCode ?? 400 },
      );
    }

    return NextResponse.json(currencySchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
