import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { actionSchema } from '@infrastructure/types/action';
import { actionFactory } from '@infrastructure/adapters/db/mysql/factories/action';

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/actions/[actionIsin]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { actionIsin } = await ctx.params;

    const body = await req.json();
    const payload = actionSchema.parse(body);

    const result = await actionFactory().admin.updateAction.execute({
      userId: session.user.id,
      ISIN: actionIsin,
      name: payload.name,
      totalNb: payload.totalNb,
      symbol: payload.symbol,
      market: payload.market,
      activitySector: payload.activitySector,
      priceAmount: payload.priceAmount,
      priceCurrency: payload.priceCurrency,
      isAvailable: payload.isAvailable,
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
