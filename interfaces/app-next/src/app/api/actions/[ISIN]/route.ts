import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { newActionSchema } from '@infrastructure/types/action';
import { actionFactory } from '@infrastructure/adapters/db/mysql/factories/action';

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/actions/[ISIN]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ISIN } = await ctx.params;

    const body = await req.json();
    const payload = newActionSchema.parse(body);
    console.log(payload);
    const result = await actionFactory().admin.updateAction.execute({
      userId: session.user.id,
      ISIN,
      ...payload,
      priceAmount: payload.price.amount,
      priceCurrency: payload.price.currency,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
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

export async function GET(req: NextRequest, ctx: RouteContext<'/api/actions/[ISIN]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { ISIN } = await ctx.params;

    const result = await actionFactory().getAction.execute({
      userId: session.user.id,
      ISIN,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 404 },
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
