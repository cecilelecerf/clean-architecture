import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { currencyFactory } from '@infrastructure/adapters/db/mysql/factories/currency';
import { updateCurrencySchema } from '@infrastructure/types/currency';
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/currencies/[code]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await ctx.params;
    const body = await req.json();
    const payload = updateCurrencySchema.parse(body);

    const result = await currencyFactory().admin.updateCurrencyRate.execute({
      code,
      actorId: session.user.id,
      newRate: payload.exchangeRate,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: (result as any).statusCode ?? 400 },
      );
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

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/currencies/[code]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await ctx.params;

    const result = await currencyFactory().admin.deleteCurrency.execute({
      code,
      actorId: session.user.id,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: (result as any).statusCode ?? 400 },
      );
    }

    return NextResponse.json({ message: 'Currency supprimée avec succès' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
